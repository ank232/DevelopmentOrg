trigger TriggerOnCustomInvoice on Invoice__c (before insert,before delete,before update,
                                              after insert, after update, after delete) 
{
    // Before Delete
    if(Trigger.IsBefore && Trigger.IsDelete)
    {
        InvoiceHandler.restrictDeleteInvoices(Trigger.OldMap);
    }
    if(Trigger.IsBefore && Trigger.IsUpdate)
    {
        InvoiceHandler.restrictUpdate(Trigger.New, Trigger.OldMap);
    }
    // After Insert
    if(Trigger.IsAfter && Trigger.IsInsert)
    {       
       InvoiceHandler.UpdateInvoice(Trigger.New, Null);
    }
    // After Update
    if(Trigger.IsAfter && Trigger.IsUpdate)
    {
        // System.debug('Trigger on Invoice is running(Update)');
        //CustomInvoicesTriggerhandler.CalculateGrandTotalOnAccount(Trigger.New);
        InvoiceHandler.UpdateInvoice(Trigger.New, Trigger.Oldmap);
        //InvoiceHandler.PerformInvoiceTotal(Trigger.New, Trigger.Oldmap);
    }  
}