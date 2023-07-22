public with sharing class CreateInvoice {
    @AuraEnabled
    public static Id GetInvoiceDetails(String customerId, String status, string invoicedate, String companyId, String duedate, string fromAddress,
                                        String comment, String invoiceno, String referenceno) {
                                           
                                           Date convertedinvoiceDate = convertDate(invoicedate);
                                           Date convertduedate = convertDate(duedate);
                                           Invoice__c invoiceRecord = new Invoice__c();
                                           invoiceRecord.Company__c = companyId;
                                           invoiceRecord.Customer__c = customerId;
                                           invoiceRecord.From_Address__c  = fromAddress;
                                           invoiceRecord.Invoice_Number__c = invoiceno;
                                           invoiceRecord.Due_Date__c = convertduedate;
                                           invoiceRecord.Invoice_Date__c = convertedinvoiceDate;
                                           invoiceRecord.Reference__c = referenceno;
                                           invoiceRecord.Comments__c = comment;
                                           invoiceRecord.Status__c = 'Draft';
                                           System.debug(invoiceRecord);
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
    // Method to insert LineItems: 
    @AuraEnabled
    public static String  InsertLineItems(List<Invoice_Line_Items__c> LineItems){
        System.debug('This method will take list of lineiTems and then insert them');
        System.debug('Values are-----');
        System.debug(LineItems);
        try{
insert LineItems;
return 'Created LineItems';
        }catch(Exception e){
             throw new AuraHandledException('Problem!!' + e.getMessage());
        }
    }
}