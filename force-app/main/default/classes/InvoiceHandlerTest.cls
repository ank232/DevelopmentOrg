@isTest 
public class InvoiceHandlerTest {

    @isTest
 static void RecordsCreationTest()
{ 
    Map<Id, List<Invoice_Line_Items__c>> invoiceLineMap = new Map<Id,List<Invoice_Line_Items__c>>();
    List<String> prodNames = new List<String>{'Prod1','Prod2', 'Prod3'};

    List<product2> products =InvoiceManagementTestDataFactory.createProductRecord(prodNames);
    Account acc = InvoiceManagementTestDataFactory.createCompanyRecord('InvAcc1',true);
    Contact con = InvoiceManagementTestDataFactory.createContactRecord(true);
    List<Invoice__c> invoice = InvoiceManagementTestDataFactory.createInvoiceRecord(acc.Id, con.Id,2);

    for(Integer i=0;i<invoice.size();i++)
    {
        List<Invoice_Line_Items__c> items = InvoiceManagementTestDataFactory.createLinesItemsRecord(invoice[i].Id,3,products[i].Id);
        invoiceLineMap.put(invoice[i].Id, items);
     }

    System.assertEquals(2, invoice.size(), 'invoiceCreated'); // Invoice Assertion

    for(Id inv: invoiceLineMap.keyset())
    {
        System.assertEquals(invoiceLineMap.get(inv).size(), 3);
    }

    List<Account> accounts = [SELECT PAID_INVOICES__c, Open_Invoices__c,OverDue_Invoices__c FROM ACCOUNT WHERE ID=: acc.Id];

    List<Invoice__c> invoices = [SELECT GRAND_TOTAL__c from Invoice__c WHERE Company__c =: acc.Id];
    Double totalAmnt =0;

    for(Invoice__c inv: invoices)
    {
        totalAmnt+=inv.Grand_Total__c;
    }

    for(Account ac : accounts)
    {
        System.assertEquals(ac.Paid_Invoices__c, 0);
        System.assertEquals(ac.Open_Invoices__c,totalAmnt,'Total Open invoices');
    }    
}

@isTest 
static void updateInvoiceTest()
{
    Map<Id, List<Invoice_Line_Items__c>> invoiceLineMap = new Map<Id,List<Invoice_Line_Items__c>>();
    List<String> prodNames = new List<String>{'Prod1','Prod2', 'Prod3'};

    List<product2> products =InvoiceManagementTestDataFactory.createProductRecord(prodNames);
    Account acc = InvoiceManagementTestDataFactory.createCompanyRecord('InvAcc1',true);
    Contact con = InvoiceManagementTestDataFactory.createContactRecord(true);
    List<Invoice__c> invoice = InvoiceManagementTestDataFactory.createInvoiceRecord(acc.Id, con.Id,3);

    for(Integer i=0;i<invoice.size();i++)
    {
        List<Invoice_Line_Items__c> items = InvoiceManagementTestDataFactory.createLinesItemsRecord(invoice[i].Id,3,products[i].Id);
        invoiceLineMap.put(invoice[i].Id, items);
     }

    /* Updating status */  
    List<Invoice__c> insertedInvoices = [SELECT ID,Name,Invoice_Number__c ,Status__c, Comments__c FROM Invoice__c Where Id In: invoiceLineMap.keyset()];
    List<Invoice__c> invoiceToupdate = new List<Invoice__c>();
    Id invoiceId ;
    for(Invoice__c inv: insertedInvoices)
    {
         if(inv.Invoice_Number__c == 'TestInvoice 1')
         {  
            invoiceId = inv.Id;
             inv.Status__c = 'Paid';
             inv.Comments__c = 'Updated to Paid';
         }
         invoiceToupdate.add(inv);
    }
    update invoiceToupdate;
    List<Invoice_Line_Items__c> relatedLines  = [SELECT ID,DESCRIPTION__C FROM INVOICE_LINE_ITEMS__c where Invoice__c =: invoiceId ];
    Invoice_Line_Items__c lineItem = new Invoice_Line_items__c
    (
        Invoice__c = invoiceId,
        Description__c = 'Line Item added to TestInvoice 1',
        Unit_Amount__c = 100,
        Quantity__c = 2,
        Tax__c = 3
        );
        relatedLines.add(lineItem);
    try {    
        upsert relatedLines;
    } 
    catch (Exception e) {    
    System.assertEquals('Invoice is paid, you cannot edit anything', e.getDmlMessage(0));
    }
}

@isTest 
static void DeleteInvoiceTest()
{
    Map<Id, List<Invoice_Line_Items__c>> invoiceLineMap = new Map<Id,List<Invoice_Line_Items__c>>();
    List<String> prodNames = new List<String>{'Prod1','Prod2', 'Prod3'};

    List<product2> products =InvoiceManagementTestDataFactory.createProductRecord(prodNames);
    Account acc = InvoiceManagementTestDataFactory.createCompanyRecord('InvAcc1',true);
    Contact con = InvoiceManagementTestDataFactory.createContactRecord(true);
    List<Invoice__c> invoice = InvoiceManagementTestDataFactory.createInvoiceRecord(acc.Id, con.Id,3);

    for(Integer i=0;i<invoice.size();i++)
    {
        List<Invoice_Line_Items__c> items = InvoiceManagementTestDataFactory.createLinesItemsRecord(invoice[i].Id,3,products[i].Id);
        invoiceLineMap.put(invoice[i].Id, items);
     }
     /* Performing Delete on Invoice*/
     List<Invoice__c> insertedInvoices = [SELECT Id FROM Invoice__c WHERE Id IN: invoiceLineMap.keyset()];
     try {
        delete insertedInvoices;
    } 
    catch(Exception e) {        
        for(invoice__c inv: insertedInvoices)
        {
            System.assertEquals('This Invoice cannot be deleted since it is saved as Draft', e.getDmlMessage(0));
        }
    }
}
}