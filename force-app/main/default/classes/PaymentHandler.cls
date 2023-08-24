public with sharing class PaymentHandler 
{
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