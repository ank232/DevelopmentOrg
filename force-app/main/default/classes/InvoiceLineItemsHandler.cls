public class InvoiceLineItemsHandler {
    public static void PreventDeleteOnPaidInvoice(Map<Id, Invoice_Line_Items__c> delLineItems){
   System.debug('I will prevent the delete of lines on paid invoices');
    }
    /* Method to Prevent Modification on LineiTem if the invoice is Paid */    
    public static void PreventEditOnLineItem(Map<Id, Invoice_line_Items__c> lineItems)
    {
        Set <id> invoiceHavingLines = new Set<id>();
        for(Id lineId: lineItems.keyset()){
            invoiceHavingLines.add(lineItems.get(lineId).Invoice__c);
        }
        System.debug('invoicehavingLines--');
        System.debug(invoiceHavingLines);
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
                System.debug('----');
         for(Invoice_Line_Items__c lines : lineItems.values())
         {
            System.debug(lines);
             if(inv.get(lines.Invoice__c)!=null && inv.get(lines.Invoice__c).Status__c=='Paid')
             {
                System.debug(' I am satisfied');
             lines.addError('Invoice is paid, you cannot edit anything');
              throw new AuraHandledException('Invoice is paid, you cannot edit anything');
            }
        }
    }
    }
}