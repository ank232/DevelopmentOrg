public class InvoiceLineItemsHandler {
    public static void PreventDeleteOnPaidInvoice(Map<Id, Invoice_Line_Items__c> delLineItems){
      System.debug('I will prevent Delete Op on LineItem if they have invoice as Paid');
      System.debug('DeleteLineItems are-> ' +delLineItems.size());
      Set<Id> invoiceIds = new Set<Id>();
      for(Invoice_Line_Items__c lineItem: delLineItems.values())
      {
        invoiceIds.add(lineItem.Invoice__c);
      }
      Map<Id, Invoice__c> invoices = new Map<Id,Invoice__c>([
        SELECT 
        Id, 
        Status__c 
        FROM 
        Invoice__c 
        WHERE 
        Id IN: invoiceIds
        AND 
        Status__c ='Paid'
      ]);
      for(Invoice_Line_items__c item: delLineItems.values())
      {
        if(invoices.containskey(item.Invoice__c))
        {
            item.addError('This Line Item is related to a paid invoice and cannot be deleted');
        }
      }
    //   List<Invoice_Line_Items__c> lineItemstobeDeleted = [SELECT ID, INVOICE__R.STATUS__C from Invoice_Line_Items__c where Id IN: delLineItems.keyset()];
    //  if(! lineItemstobeDeleted.isEmpty())
    //  {
    //     for(Invoice_Line_Items__c item: lineItemstobeDeleted)
    //     {
    //         if(item.Invoice__r.Status__c =='Paid'){
    //             item.addError('This LineItem is related to a paid invoice and cannot be deleted');
    //         }
    //     }
    //  }
    }
    /* Method to Prevent Modification on LineiTem if the invoice is Paid */    
    public static void PreventEditOnLineItem(Map<Id, Invoice_line_Items__c> lineItems)
    {
        Set <id> invoiceHavingLines = new Set<id>();
        for(Id lineId: lineItems.keyset()){
            invoiceHavingLines.add(lineItems.get(lineId).Invoice__c);
        }
        // System.debug('invoicehavingLines--');
        // System.debug(invoiceHavingLines);
        if(!invoiceHavingLines.isEmpty())
        {            
         Map<Id,Invoice__c> inv= new Map<Id,Invoice__c>( 
            [
                SELECT 
                ID ,
                NAME, 
                Status__c 
                FROM 
                INVOICE__c 
                WHERE 
                Id in: invoiceHavingLines]);
                // System.debug('----');
         for(Invoice_Line_Items__c lines : lineItems.values())
         {
            // System.debug(lines);
             if(inv.get(lines.Invoice__c)!=null && inv.get(lines.Invoice__c).Status__c=='Paid')
             {
                // System.debug(' I am satisfied');
             lines.addError('Invoice is paid, you cannot edit anything');
            //   throw new AuraHandledException('Invoice is paid, you cannot edit anything');
            }
        }
    }
    }
    // Method to prevent addition of invoice lines when invoice status is Paid
    public static void PreventInsertofLinesOnPaidInvoice(List<Invoice_Line_Items__c> lineItems){
        Set<Id> invoiceIds = new Set<Id>();
        for(Invoice_Line_Items__c line: lineItems)
        {
            invoiceIds.add(line.Invoice__c);
        }
        // Querying the related invoices WHERE STATUS IS MARKED AS PAID 
        List<Invoice__c> relatedInvoices = [SELECT Id,Name FROM Invoice__c WHERE Id IN: invoiceIds AND  status__c ='Paid'];
        System.debug('is Inserted invoices are Paid?');
        if(!relatedInvoices.isEmpty())
        {
            for(Invoice__c invoice: relatedInvoices)
            {
                System.debug(invoice);
                invoice.addError('Cannot add any line Items on Paid Invoice');
            }
        }     
    }
}