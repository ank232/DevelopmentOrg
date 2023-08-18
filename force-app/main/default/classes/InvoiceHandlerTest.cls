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
    try {
        delete accounts;
    } 
    catch(Exception e) {
        for(Account ac: accounts)
        {
            System.assertEquals('No you cannot delete this account',e.getDmlMessage(0));
        }
    }
}
}