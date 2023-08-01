trigger InvoiceLineItemTrigger on Invoice_Line_Items__c (before delete, before update) {
    if(trigger.isBefore && trigger.isDelete)
    {
        InvoiceLineItemsHandler.PreventDeleteOnPaidInvoice(trigger.oldMap);
    }

    if(trigger.isBefore && trigger.isUpdate){
        // Prevent modification on LineItem if Invoice is paid
        InvoiceLineItemsHandler.PreventEditOnLineItem(trigger.newMap);
    }
}