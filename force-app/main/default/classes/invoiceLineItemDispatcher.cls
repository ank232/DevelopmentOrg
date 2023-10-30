public class invoiceLineItemDispatcher {
  public static void dispatch(System.TriggerOperation operationType) {
    switch on operationType {
      when BEFORE_INSERT {
        InvoiceLineItemsHandler.PreventInsertofLinesOnPaidInvoice(
          (List<Invoice_Line_Items__c>) Trigger.new
        );
      }
      when BEFORE_UPDATE {
        InvoiceLineItemsHandler.PreventEditOnLineItem(
          (Map<Id, Invoice_Line_Items__c>) Trigger.newMap
        );
      }
      when BEFORE_DELETE {
        InvoiceLineItemsHandler.PreventDeleteOnPaidInvoice(
          (Map<Id, Invoice_Line_Items__c>) Trigger.oldMap
        );
      }
      when else {
        System.debug('OTHER OPERATION RUNNING');
      }
    }
  }
}
