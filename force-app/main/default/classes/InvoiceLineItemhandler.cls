public class InvoiceLineItemhandler {
public static void CalculateTotalAmntOnAcc(List<invoice_Line_Items__c> newLineItems)
{
    System.debug('Trigger is Running on LineItem(after Insert)');
    Set<Id> invoiceIds = new Set<Id>();
    for(Invoice_Line_Items__c lineItem :newLineItems)
    {
        if(lineItem.Invoice__c != Null){
        invoiceIds.add(lineItem.Invoice__c);
        }
    }
    System.debug('Collected Ids are---');
  System.debug(invoiceIds);
}
}