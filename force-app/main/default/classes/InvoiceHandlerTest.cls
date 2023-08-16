@isTest 
public class InvoiceHandlerTest {
    @isTest
 static void RecordsCreationTest()
{ 
    Map<Id, List<Invoice_Line_Items__c>> invoiceLineMap = new Map<Id,List<Invoice_Line_Items__c>>();
    Account acc = InvoiceManagementTestDataFactory.createCompanyRecord(true);
    Contact con = InvoiceManagementTestDataFactory.createContactRecord(true);
    List<Invoice__c> invoice = InvoiceManagementTestDataFactory.createInvoiceRecord(acc.Id, con.Id,2);
    for(Invoice__c inv: invoice)
    {
        List<Invoice_Line_Items__c> lineItems = InvoiceManagementTestDataFactory.createLinesItemsRecord(inv.Id,'01t2w00000HDA5LAAX',2);
        invoiceLineMap.put(inv.Id, lineItems);
    }
    System.assertEquals(2, invoice.size(), 'invoiceCreated');
    
}
}