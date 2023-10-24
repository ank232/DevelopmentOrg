/*
            ===================================================
            Test Cases to Test InvoiceManagemnt Application
              Cases: 
                    *  Positive Cases 
                    *  Bulk records 
                    *  Negative Cases      
            ====================================================
*/ 

@isTest 
public class InvoiceHandlerTest {
    @isTest
 static void recordsCreationTest()
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
        System.assertEquals(invoiceLineMap.get(inv).size(), 3); // Invoice line Item Assertion
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
        System.assertEquals(ac.Open_Invoices__c,totalAmnt,'Total Open invoices'); // Rollup field Assertion on Insert Operation
    }    
}
/*
        ====================================
        Testing if user can update invoice 
        and its related invoices if its paid
        =====================================
*/ 
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
    update invoiceToupdate; // Updating invoice
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
        System.assert(false,'Exception should be thrown but not');
    } 
    catch (Exception e) {    
    System.assertEquals('Invoice is paid, you cannot edit anything', e.getDmlMessage(0));
    }
}
/*
        ===================================
        Testing if user can Delete 
        Invoice if its paid from the System 
        ===================================
*/ 
@isTest 
static void deleteInvoiceTest()
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
     Set<id> invoiceIds = new Set<Id>();
     for(invoice__c inv: insertedInvoices)
     {
        invoiceIds.add(inv.Id);
     }
     try {
        delete insertedInvoices;
        System.assert(false,'Delete exception should be thrown'); // Attempting Delete of Invoice on invoice insert
    } 
    catch(Exception e) {        
        for(invoice__c inv: insertedInvoices)
        {
            System.assertEquals('This Invoice cannot be deleted since it is saved as Draft', e.getDmlMessage(0));
        }
    }
    /*
    Performing Deletion of LineItems when Invoice is Paid
    */ 
    LIST<INVOICE__C> updateInvoice = [SELECT ID,Status__c FROM INVOICE__C WHERE INVOICE_NUMBER__C ='TestInvoice 2' And Invoice_Number__c ='TestInvoice 1'];
    for(invoice__c inv: updateInvoice)
    {
        inv.Status__c = 'Paid';
    }
    try{
        update updateInvoice; // updating the invoice status to paid 
        system.assert(true,'Invoice should be updated');
    }
    catch(Exception e)
    {
        System.debug('The error is-> '+ e.getMessage());
    }
     LIST<INVOICE__C> invoiceToupdate = [SELECT ID,Status__c FROM INVOICE__C WHERE INVOICE_NUMBER__C ='TestInvoice 2' And Invoice_Number__c ='TestInvoice 1'];
    for(invoice__c inv: invoiceToupdate)
    {
        inv.Status__c = 'Paid';
    }
    update invoiceToupdate;
    List<invoice_Line_Items__c> lineItems = [SELECT ID, NAME FROM INVOICE_LINE_ITEMS__C where Invoice__c IN: invoiceToupdate];
    try{
        delete lineItems; // Attempting deletion of its related-lineItems
        System.assertEquals(lineItems.size(),0,'Line Item not delted, exception thrown');
        // System.assert(false,'Delete LineItem exception should be thrown');
    }catch(Exception e)
    {
        System.debug('Delete DML failed');
        System.assertEquals('This Line Item is related to a paid invoice and cannot be deleted', e.getDmlMessage(0));
    }
}
/*
            ===========================================
            Testing Batch Apex that handles deletion 
            of Invoices from past 1 year from the System
            ============================================
*/ 
@isTest
static void testBatchDelete()
{
    Account acc = InvoiceManagementTestDataFactory.createCompanyRecord('InvAcc1',true);
    Contact con = InvoiceManagementTestDataFactory.createContactRecord(true);
    List<Invoice__c> invoices = new List<Invoice__c>();
    Date oneYearAgo = Date.today().addYears(-1);
    for (Integer i = 0; i < 30; i++) {
            invoices.add(new Invoice__c(
                Invoice_Number__c = 'Invoice ' + i,
                Customer__c = con.Id,
                Company__c = acc.Id,
                Status__c ='Paid',
                Invoice_date__c = Date.today(),
                Due_date__c = Date.today().addDays(6),
                Comments__c = 'Description '+ i
            ));
        }
        insert invoices;
        for(Invoice__c inv: invoices)
        {
            Test.setCreatedDate(inv.Id, oneYearAgo);
        }
        insert new InvoiceHandler__c(
            SetupOwnerId = UserInfo.getProfileId(),
            bypassTrigger__c = true
            );
        // Start the batch job
        Test.startTest();
       DeleteInvoicesBatchProcess batchDelete = new DeleteInvoicesBatchProcess();
       Id batchId =Database.executeBatch(batchDelete);
       Test.stopTest();
       System.assert(batchId!= Null,'Batch has failed');
       // Verify that the invoices were deleted
        List<Invoice__c> remainingInvoices = [SELECT Id FROM Invoice__c];
        System.assertEquals(0, remainingInvoices.size(), 'All invoices should have been deleted.');
}

    /*
                ===========================================
                    Negative Testing:
                        Cases-> 
                            * Inserting Invoice with  
                            invoice date set in past.
                            * More....
                ===========================================
    */ 
    @isTest 
    static void testNegativeTest()
    {
        //Test1: Creating a invoice with a past date
        Account acc = InvoiceManagementTestDataFactory.createCompanyRecord('NegativeTest Acc', true);
        Contact con = InvoiceManagementTestDataFactory.createContactRecord(acc.Id, true);
        Invoice__c invoicewithpastDate =new Invoice__c(
        company__c = acc.Id,
        customer__c = con.Id,
        Status__c='Approved',
        Invoice_Date__c = date.today().addDays(-10),
        Due_date__c = date.today().addDays(-19),
        Comments__c = 'Negative Test Desc'
       );
       try{
           insert invoicewithpastDate;
           System.assert(false, 'Invoice should not be inserted');
       }catch(Exception e)
       {
        System.assert(true,e.getMessage());
       }
       // Test2: Performing it in bulk: 1.creating invoice with right data 2. creating invoice with past date
       List<invoice__c> testingDateonInvoices  = new List<Invoice__c>();
       Invoice__c inv1 = new Invoice__c(
        Invoice_number__c = 'Inv1',
        company__c = acc.Id,
        customer__c  = con.Id,
        Status__c = 'Voided',
        Invoice_date__c =date.today().addDays(12),
        Due_date__c = date.today().addDays(20),
        Comments__c = 'Inserted'
       );
       testingDateonInvoices.add(inv1);
       Invoice__c inv2 = new Invoice__c(
        Invoice_number__c = 'Inv2',
        company__c = acc.Id,
        customer__c = con.Id,
        Invoice_Date__c = date.today().addDays(-20),
        Paid_date__c  = date.today().addDays(2),
        Status__c = 'Voided',
        Comments__c = 'Rejected'
       );
       testingDateonInvoices.add(inv2);
       Database.saveResult[] res =Database.insert(testingDateonInvoices,false);
       for(Database.SaveResult result: res)
       {
        if(!result.isSuccess())
        {
            for(Database.Error err: result.getErrors())
            {
                System.debug('Not inserted');
                System.assertEquals(err.message,'Invoice Date should not be in past');
            }
        }
       }
       List<Invoice__c> deletedInvoices = [SELECT ID FROM INVOICE__c];
       delete deletedInvoices;
    }  
}