public with sharing class InvoiceHandler {
    public InvoiceHandler() {

    }
    /*
    This method is used to Calulate the open, closed and overdue invoices.
    */ 
    public static void InsertInvoice(List<Invoice__c> NewInvoices ){
        Set<Id> invoiceRecIds = new Set<Id>();
        for(Invoice__c invoiceRec: NewInvoices){
            invoiceRecIds.add(invoiceRec.Id);
        }
        System.debug('Invoices to update...');
        System.debug(invoiceRecIds);
        // List<Invoices__c> getInvoices =  [SELECT ID, STATUS__C FROM INVOICE__C GROUP BY STATUS__C];
    }
}