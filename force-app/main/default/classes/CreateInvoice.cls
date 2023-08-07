public with sharing class CreateInvoice {
    @AuraEnabled
    public static String[] GetInvoiceDetails(
        String customerId, String status, string invoicedate,
        String companyId, String duedate, string fromAddress,
        String comment, String invoiceno, String referenceno) 
        {     
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
                                           try {
                                               insert invoiceRecord;
                                               System.debug('I am creating the invoice!!!');
                                               System.debug('Invoice is created!!');
                                               System.debug('---===>'+invoiceRecord.Name);
                                               string invoiceId =String.valueOf(invoiceRecord.Id);
                                               Invoice__c  createdInv =[SELECT NAME FROM Invoice__c WHERE ID =: invoiceId limit 1];
                                               List<String> insertedInvoice = New List<String> {invoiceId,createdInv.Name};
                                               return insertedInvoice;
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
    public static Integer  InsertLineItems(List<Invoice_Line_Items__c> LineItems){
        System.debug('This method will take list of lineiTems and then insert them');
        System.debug('Values are-----');
        // System.debug(LineItems);
        Integer count=0;
        for(Invoice_Line_items__c line: LineItems)
        {
            System.debug('----');
            System.debug(line);
            System.debug('0000');
        }
        Set<Id> insertedlines = new Set<Id>();
        try{
           Database.UpsertResult [] upsertLineItems = Database.upsert(LineItems,false);
           for(Database.UpsertResult res : upsertLineItems)
           {
            if(res.isSuccess())
            {
                if(res.isCreated()){
                    System.debug('----|');
                 insertedlines.add(res.getId());
                    System.debug('----');
                }
                count++;
            }
           }
           System.debug('Records Created are-->'+ insertedlines);
           if(!insertedlines.isEmpty()){
            // GetInsertedLines(insertedlines);
           }
            return count;
        }catch(Exception e){
             throw new AuraHandledException('Problem!!' + e.getMessage());
        }
    }
}