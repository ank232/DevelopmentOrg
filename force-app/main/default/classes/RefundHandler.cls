public with sharing class RefundHandler {
    public static void checkrefundDate(List<Refund__c> verifyRefunds)
    {
        Set<Id> invoiceIds = new Set<Id>();
        for(Refund__c ref: verifyRefunds)
        {
            invoiceIds.add(ref.Invoice__c);
        }
        // Step 2: 
        // Fetching the invoice and it related paymentrecs
        // checking if
        Map<Id, Invoice__c> invoiceMap = new Map<Id, Invoice__c>([SELECT ID,(SELECT ID,Status__c,Date__c from Payments__r) FROM Invoice__c WHERE ID IN: invoiceIds]);
        for(Id invId : invoiceMap.keyset())
        {
            if(invoiceMap.get(invId).Payments__r.isEmpty())
        {
            invoiceMap.get(invId).addError('First record a payment');
        }
        else{
            system.debug('I will check for the dates');
        }
        }
    }
    private static void checkMaxDate(List<Payment__c> paymentsRecs)
    {
        for(payment__c paymentRec: paymentsRecs)
        {
            
        }
    }
}