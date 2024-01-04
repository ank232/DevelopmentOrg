public with sharing class RefundHandler {
  public static void checkrefundDate(List<Refund__c> verifyRefunds) {
    Set<Id> invoiceIds = new Set<Id>();
    for (Refund__c ref : verifyRefunds) {
      invoiceIds.add(ref.Invoice__c);
    }
    Map<Id, Invoice__c> invoiceMap = new Map<Id, Invoice__c>(
      [
        SELECT
          ID,
          Paid_date__c,
          (
            SELECT ID, Status__c, Amount__c, Date__c
            FROM Payments__r
          ),
          (
            SELECT ID, Date__c, Amount__c, LastModifiedDate
            FROM Refunds__r
            ORDER BY LastModifiedDate DESC
          )
        FROM Invoice__c
        WHERE ID IN :invoiceIds
      ]
    );
    if (!invoiceMap.isEmpty()) {
      for (Refund__c refund : verifyRefunds) {
        validateRefund(refund, invoiceMap.get(refund.Invoice__c));
      }
    }
  }

  private static void validateRefund(
    Refund__c refundRec,
    Invoice__c invoiceRec
  ) {
    List<Payment__c> paymentsRecorded = invoiceRec.Payments__r;
    List<Refund__c> existingRefunds = invoiceRec.Refunds__r;
    System.debug('Amnt-:' + refundRec.Amount__c);
    if (refundRec.Amount__c <= 0) {
      refundRec.addError('Amount cannot be null');
      return;
    }
    // checking if the has any payment or not
    if (paymentsRecorded.isEmpty()) {
      refundRec.addError('Refund should have atleast one payment');
      return;
    }
    if (refundRec.Date__c < invoiceRec.Paid_date__c) {
      refundRec.addError('Refund Date must be after the paid Date');
    }
    // double maxRefundableAmnt = calculateRefundAmount(existingRefunds);
    // double payableAmnt = PaymentHandler.calculateTotalAmnt(paymentsRecorded);
    // // checking if user gave amnt greater than the payments amnt
    // if (refundRec.Amount__c > payableAmnt) {
    //   refundRec.addError('Refund cannot be greater than paid amount');
    //   return;
    // }
    // if (refundRec.Amount__c + maxRefundableAmnt > payableAmnt) {
    //   refundRec.addError('Refund amount exceeded');
    //   return;
    // }
    // if refunds been made already
    if (!existingRefunds.isEmpty()) {
      Date latestrefundedDate = invoiceRec.Refunds__r[0].Date__c;
      if (invoiceRec.Paid_date__c > latestrefundedDate) {
        refundRec.addError(
          'Refund Date should atleast one day after the latest payment has been recorded'
        );
      }
    }
  }

  /*
This method will find the latest payment Made against the invoice and 
will compaere it to the paidDate On invoiceObj Record
*/
  private static Boolean setRefundDate(
    Date invoicePaidDate,
    List<Refund__c> refunds
  ) {
    for (Refund__c ref : refunds) {
    }
    return false;
  }
  private static double calculateRefundAmount(List<Refund__c> refundData) {
    double amnt = 0;
    for (refund__c ref : refundData) {
      amnt += ref.Amount__c;
    }
    return amnt;
  }
}
