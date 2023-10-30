trigger InvoiceLineItemTrigger on Invoice_Line_Items__c(
  before delete,
  before update,
  before insert
) {
  invoiceLineItemDispatcher.dispatch(Trigger.OperationType);
  // if(trigger.isBefore && trigger.isDelete)
  // {
  //     // Preventing deletion of lineItems on paid Invoices
  //     InvoiceLineItemsHandler.PreventDeleteOnPaidInvoice(trigger.oldMap);
  // }

  // if(trigger.isBefore && trigger.isUpdate){
  //     // Prevent modification on LineItem if Invoice is paid
  //     InvoiceLineItemsHandler.PreventEditOnLineItem(trigger.newMap);
  // }
  // if(trigger.isBefore&& trigger.isInsert)
  // {
  //     System.debug('Before insert (LineItems running)');
  //     InvoiceLineItemsHandler.PreventInsertofLinesOnPaidInvoice(trigger.new);
  // }
}
