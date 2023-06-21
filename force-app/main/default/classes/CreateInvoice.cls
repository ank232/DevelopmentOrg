public with sharing class CreateInvoice {
    @AuraEnabled
    public static Id GetInvoiceDetails(String customerId, String status, string invoicedate, String companyId, String duedate,
        String paiddate, String comment, String invoiceno, String referenceno) {
        
Date convertedinvoiceDate = convertDate(invoicedate);
Date convertedpaiddate = convertDate(paiddate);
Date convertduedate = convertDate(duedate);
        Invoice__c invoiceRecord = new Invoice__c();
        invoiceRecord.Company__c = companyId;
        invoiceRecord.Customer__c = customerId;
        invoiceRecord.Status__c = status;
        invoiceRecord.Invoice_Number__c = invoiceno;
        invoiceRecord.Due_Date__c = convertduedate;
        invoiceRecord.Paid_Date__c = convertedpaiddate;
        invoiceRecord.Invoice_Date__c = convertedinvoiceDate;
        invoiceRecord.Reference__c = referenceno;
        invoiceRecord.Comments__c = comment;
        
        try {
            insert invoiceRecord;
            return invoiceRecord.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Cannot Insert Invoice Record!');
        }
    }

	private static Date convertDate(String invoicedate){
		Date newDate = Date.valueOf(invoicedate);
        return newDate;
	} 
}
