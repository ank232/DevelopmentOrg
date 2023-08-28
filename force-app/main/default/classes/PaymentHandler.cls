public with sharing class PaymentHandler 
{
    public static void checkPaymentDate(List<Payment__c> paymentsToverfied)
    {
        Set<Id> payableinvoiceIds = new Set<Id>();
        for(payment__c pay: paymentsToverfied)
        {
            payableinvoiceIds.add(pay.Invoice__c);
        }
        Map<Id,Invoice__c> invoiceHavingPayments = new Map<Id,Invoice__c>([
            SELECT
            Id,
            Status__c,
            Invoice_date__c
            FROM 
            INVOICE__c 
            WHERE 
            ID 
            In: payableinvoiceIds 
        ]);
        if(! invoiceHavingPayments.isEmpty())
        {
            for(Payment__c payment: paymentsToverfied)
            {               
                if(invoiceHavingPayments.containskey(payment.Invoice__c))
                {
                    if(invoiceHavingPayments.get(Payment.Invoice__c).Status__c !='Approved')
                    {
                        payment.addError('Payment must be verified first');
                    }
                    if(payment.Date__c < invoiceHavingPayments.get(payment.Invoice__c).Invoice_date__c)
                    {
                        payment.addError('Payment date should be in future or should be greater than invoiceDate');
                    }                  
                }
            }
        }
    }
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