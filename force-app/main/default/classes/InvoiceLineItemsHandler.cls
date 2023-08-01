public class InvoiceLineItemsHandler {
    public static void PreventDeleteOnPaidInvoice(Map<Id, Invoice_Line_Items__c> delLineItems){
   
    }
    /* Method to Prevent Modification on LineiTem if the invoice is Paid */
    public static void PreventEditOnLineItem(Map<Id, Invoice_line_Items__c> lineItems)
    {
        Set <id> invoiceHavingLines = new Set<id>();
        for(Id lineId: lineItems.keyset()){
            invoiceHavingLines.add(lineItems.get(lineId).Invoice__c);
        }
        System.debug('invoicehavingLines--');
        if(!invoiceHavingLines.isEmpty())
        {
         Map<Id,Invoice__c> inv= new Map<Id,Invoice__c>( [SELECT ID ,NAME, Status__c FROM INVOICE__c where id in: invoiceHavingLines]);
         for(Invoice_Line_Items__c lines : lineItems.values())
         {
             if(inv.get(lines.Invoice__c)!=null && inv.get(lines.Invoice__c).Status__c=='Paid')
             {
             lines.addError('Invoice is paid, you cannot edit anything')    ;
            }
        }
    }
    }
}