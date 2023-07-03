trigger TriggerOnCustomInvoice on Invoice__c (before insert,after insert, after update, after delete) 
{
    if(Trigger.isAfter && Trigger.isInsert)
    {
        InvoiceHandler.InsertInvoice(Trigger.new);
    }
    if(Trigger.isBefore && Trigger.isInsert)
    {
        InvoiceHandler.InsertInvoiceOnBefore(Trigger.new);
    }
}