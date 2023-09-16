public with sharing class PaymentHandler 
{
    public static double calculateTotalAmnt(List<Payment__c> payments)
    {        
        double totalamnt =0;
        for(payment__c pay : payments)
        {
            totalamnt+= pay.Amount__c;
        }
        return totalamnt;
    }

    private static void validatePaymentrecord(Payment__c payment, Invoice__c invoice)
    {
        if(payment.Amount__c<=0)
        {
            payment.addError('Amount cannot be null');
            return;
        }
        if(invoice.status__c!= 'Approved')
        {
            payment.addError('Please get your invoice approved');
        }
        if(payment.Date__c <invoice.Invoice_date__c)
        {
            payment.addError('Payment date should be greater than invoice date');
        }
        // Cases When Payment have been made before a new payment 
        if(!invoice.payments__r.isEmpty())
        {
            System.debug('Existing payment--> '+ calculateTotalAmnt(invoice.Payments__r));                     
            system.debug('Invoice Grand total - '+ invoice.Grand_total__c);
            string TARGET_CURRENCY = invoice.CurrencyIsoCode;
            string  TO_BE_CONVERTED  = payment.CurrencyIsoCode;
            system.debug('Invoice currency-> '+ TARGET_CURRENCY);
            system.debug('payment Currency -> '+ TO_BE_CONVERTED);
            // if(payment.Amount__c > invoice.grand_total__c - calculateTotalAmnt(invoice.payments__r))
            // {
            //     payment.addError('Residual payment exceed the lineItem Amount (' + calculateTotalAmnt(invoice.payments__r) + ')');
            // }
            if(payment.CurrencyIsoCode !=invoice.payments__r[0].CurrencyIsoCode )
            {
                payment.addError('Payment must be made in '+ invoice.payments__r[0].CurrencyIsoCode);
            }
        }
        else
            {                
                system.debug('Payment Currency');
                system.debug(payment.CurrencyIsoCode);
                system.debug('Invoice Currency');
                system.debug(invoice.CurrencyIsoCode);
                if(payment.currencyIsoCode != invoice.CurrencyIsoCode)
                {
                  Decimal payableAmount = convertToclientCurrency(invoice.Grand_total__c,invoice.CurrencyIsoCode, payment.currencyIsoCode, payment.Amount__c);
                  if(payableAmount > invoice.Grand_total__c)
                  {
                    string errorMessage = 'Payment Amount exceeded,Max-payable amount= '+invoice.CurrencyIsoCode + invoice.grand_total__c + 'Acutal-' + payableAmount + invoice.currencyIsoCode;
                    payment.addError(errorMessage);
                  }
                }                
                // if(payment.Amount__c > invoice.Grand_total__c)
                // {
                // payment.addError('Payment amount cannot exceed lineItemAmount');
                // }
            }
    }
        // Method to convert the payment into the invoice currency amount
        private static decimal convertToclientCurrency(decimal invoiceAmount, string invCurrency, string paymentCurrency, decimal payableAmount)
        {            
            decimal convertedpayment = CustomerDetailsController.currencyConvertor(payableAmount, paymentCurrency, invCurrency);
            system.debug('@@@@@@@@@@@@@ '+convertedpayment);
            return convertedpayment.setScale(3);    
        }
    // This method will responsible to validate the payment record before commiting to DB
    public static void checkPaymentDate(List<Payment__c> paymentsToverfied)
    {
        Set<Id> payableinvoiceIds = new Set<Id>();
        for(payment__c pay: paymentsToverfied)
        {
            payableinvoiceIds.add(pay.Invoice__c);
        }
        // Querying Invoice records and its related payments
        Map<Id,Invoice__c> invoiceHavingPayments = new Map<Id,Invoice__c>([
            SELECT
            Id,
            Status__c,
            Invoice_date__c,
            Grand_total__c,
            CurrencyIsoCode,
            (
                SELECT
                ID,
                AMOUNT__C,
                CurrencyIsoCode
                FROM
                PAYMENTS__R
            )
            FROM 
            INVOICE__c 
            WHERE 
            ID 
            In: payableinvoiceIds 
        ]);
        // Traversing through the queried map
        if(! invoiceHavingPayments.isEmpty())
        {
            for(Payment__c payment: paymentsToverfied)
            {
                validatePaymentrecord(payment,invoiceHavingPayments.get(payment.Invoice__c));
            }
        }
    }
    // Method to update the paid-Date on Invoice Object with the currrent Date when user created the payment
    public static void updatePaymentDateonInvoice(List<Payment__c> payments)
    {
        Set<Id> invoiceIds = new Set<Id>();
        for(Payment__c payment: payments)
        {
            if(payment.Invoice__c != Null)
            {
                invoiceIds.add(payment.Invoice__c);
            }
        }
        List<Invoice__c> relatedInvoicesforRefund = [SELECT ID,PAID_DATE__C FROM INVOICE__C WHERE ID IN: invoiceIds];
        if(!relatedInvoicesforRefund.isEmpty())
        {
            for(Invoice__c inv: relatedInvoicesforRefund)
            {
                inv.Paid_date__c = System.today();
            }
        }        
        try{ 
            update relatedInvoicesforRefund;
        }catch(DmlException dmlExec)
        {
            System.debug(dmlExec.getMessage());
        }
    }
}