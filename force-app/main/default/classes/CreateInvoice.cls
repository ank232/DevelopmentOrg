public with sharing class CreateInvoice {
  @AuraEnabled
  public static String[] GetInvoiceDetails(
    String customerId,
    String status,
    string invoicedate,
    String companyId,
    String duedate,
    string fromAddress,
    String comment,
    String invoiceno,
    String referenceno,
    string currencyCode
  ) {
    Date convertedinvoiceDate = convertDate(invoicedate);
    Date convertduedate = convertDate(duedate);
    Invoice__c invoiceRecord = new Invoice__c();
    invoiceRecord.Company__c = companyId;
    invoiceRecord.Customer__c = customerId;
    invoiceRecord.From_Address__c = fromAddress;
    invoiceRecord.Invoice_Number__c = invoiceno;
    invoiceRecord.Due_Date__c = convertduedate;
    invoiceRecord.Invoice_Date__c = convertedinvoiceDate;
    invoiceRecord.Reference__c = referenceno;
    invoiceRecord.Comments__c = comment;
    invoiceRecord.Status__c = 'Draft';
    invoiceRecord.CurrencyIsoCode = currencyCode;
    try {
      insert invoiceRecord;
      string invoiceId = String.valueOf(invoiceRecord.Id);
      Invoice__c createdInv = [
        SELECT NAME
        FROM Invoice__c
        WHERE ID = :invoiceId
        LIMIT 1
      ];
      List<String> insertedInvoice = new List<String>{
        invoiceId,
        createdInv.Name
      };
      return insertedInvoice;
    } catch (Exception e) {
      throw new AuraHandledException('Cannot Insert Invoice Record!');
    }
  }

  private static Date convertDate(String invoicedate) {
    Date newDate = Date.valueOf(invoicedate);
    return newDate;
  }
  // Method to insert LineItems:
  @AuraEnabled
  public static void InsertLineItems(List<Invoice_Line_Items__c> LineItems) {
    // System.debug('This method will take list of lineiTems and then insert them');
    Integer count = 0;
    Set<Id> insertedlines = new Set<Id>();
    try {
      upsert LineItems;
    } catch (Exception e) {
      // System.debug('Exception Caught!!');
      // System.debug('Cause: '+e.getCause());
      throw new AuraHandledException(e.getMessage());
    }
  }
}
