public with sharing class PaymentHandler {
  public static double calculateTotalAmnt(List<Payment__c> payments) {
    double totalamnt = 0;
    for (payment__c pay : payments) {
      totalamnt += pay.Amount__c;
    }
    return totalamnt;
  }

  private static void validatePaymentrecord(
    Payment__c payment,
    Invoice__c invoice
  ) {
    if (payment.Amount__c <= 0) {
      payment.addError('Amount cannot be null');
      return;
    }
    if (invoice.status__c != 'Approved') {
      payment.addError('Please get your invoice approved');
    }
    if (payment.Date__c < invoice.Invoice_date__c) {
      payment.addError('Payment date should be greater than invoice date');
    }
    // Cases When Payment have been made before a new payment
    if (!invoice.payments__r.isEmpty()) {
      System.debug('EXISTING PAYMENT');
      if (payment.CurrencyIsoCode != invoice.payments__r[0].CurrencyIsoCode) {
        payment.addError(
          'Payment must be made in ' + invoice.payments__r[0].CurrencyIsoCode
        );
      }
      Decimal existingPayments = calculateTotalAmnt(invoice.payments__r);
      decimal exchangeRate = CustomerDetailsController.currencyConvertor(
        invoice.CurrencyIsoCode,
        payment.CurrencyIsoCode
      );
      Decimal normalizedamount = exchangeRate * invoice.Grand_total__c;
      system.debug('Normailzed Value(incoming Amnt) : ' + normalizedamount);
      decimal remainingAmnt = normalizedamount - existingPayments;
      system.debug('Residual amount- ' + remainingAmnt);
      if (remainingAmnt <= 0) {
        payment.addError('Payment Already done');
      }
      //if(paidAmountInInvoiceCurrency > remainingAmnt )
      //{
      //  String errorMsg = 'Amount Exceeded the Invoice total amount. Please try again (max Limit=: ' + remainingAmnt + ')';
      //payment.addError(errorMsg);
      //}
    }
    if (invoice.payments__r.isEmpty()) {
      System.debug('NEW PAYMENT RECIEVED');
      if (payment.currencyIsoCode != invoice.CurrencyIsoCode) {
        system.debug(
          'Incoming amnt->' + payment.CurrencyIsoCode + payment.Amount__c
        );
        System.debug('Invoice Amount---> ' + invoice.Grand_total__c);
        decimal exchangeRate = CustomerDetailsController.currencyConvertor(
          invoice.CurrencyIsoCode,
          payment.CurrencyIsoCode
        );
        decimal payableAmount = invoice.Grand_Total__c * exchangeRate;
        system.debug('Amount To be paid in ' + payment.CurrencyIsoCode);
        system.debug('final Price --> ' + payableAmount);
        if (payment.Amount__c > payableAmount) {
          String errorMessage =
            'Payment amount (' +
            payment.Amount__c +
            ' ' +
            payment.CurrencyIsoCode +
            ') exceeds the invoice total (' +
            invoice.Grand_Total__c +
            ' ' +
            invoice.CurrencyIsoCode +
            '). Please review.';
          payment.addError(errorMessage);
        }
      }
    }
    if (payment.CurrencyIsoCode == invoice.CurrencyIsoCode) {
      if (payment.Amount__c > invoice.Grand_total__c) {
        payment.addError('Payment amount cannot exceed lineItemAmount');
      }
    }
  }
  // This method will responsible to validate the payment record before commiting to DB
  public static void checkPaymentDate(List<Payment__c> paymentsToverfied) {
    Set<Id> payableinvoiceIds = new Set<Id>();
    for (payment__c pay : paymentsToverfied) {
      payableinvoiceIds.add(pay.Invoice__c);
    }
    // Querying Invoice records and its related payments
    Map<Id, Invoice__c> invoiceHavingPayments = new Map<Id, Invoice__c>(
      [
        SELECT
          Id,
          Status__c,
          Invoice_date__c,
          Grand_total__c,
          CurrencyIsoCode,
          (
            SELECT ID, AMOUNT__C, CurrencyIsoCode
            FROM PAYMENTS__R
          )
        FROM INVOICE__c
        WHERE ID IN :payableinvoiceIds
      ]
    );
    // Traversing through the queried map
    if (!invoiceHavingPayments.isEmpty()) {
      for (Payment__c payment : paymentsToverfied) {
        validatePaymentrecord(
          payment,
          invoiceHavingPayments.get(payment.Invoice__c)
        );
      }
    }
  }
  // Method to update the paid-Date on Invoice Object with the currrent Date when user created the payment
  public static void updatePaymentDateonInvoice(List<Payment__c> payments) {
    Set<Id> invoiceIds = new Set<Id>();
    for (Payment__c payment : payments) {
      if (payment.Invoice__c != null) {
        invoiceIds.add(payment.Invoice__c);
      }
    }
    List<Invoice__c> relatedInvoicesforRefund = [
      SELECT ID, PAID_DATE__C, Status__c
      FROM INVOICE__C
      WHERE ID IN :invoiceIds
    ];
    if (!relatedInvoicesforRefund.isEmpty()) {
      for (Invoice__c inv : relatedInvoicesforRefund) {
        inv.Paid_date__c = System.today();
        // inv.Status__c = 'Paid';
      }
    }
    try {
      update relatedInvoicesforRefund;
    } catch (DmlException dmlExec) {
      System.debug(dmlExec.getMessage());
    }
  }
}
