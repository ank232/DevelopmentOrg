trigger TriggerOnCustomInvoice on Invoice__c(
  before insert,
  before delete,
  before update,
  after insert,
  after update,
  after delete
) {
  CustomInvoiceDispatcher.dispatch(Trigger.OperationType);
  // if(Trigger.isBefore && Trigger.isInsert)
  // {
  //     InvoiceHandler.verifyInvoiceData(Trigger.new);
  // }
  // // Before Delete
  // if(Trigger.IsBefore && Trigger.IsDelete)
  // {
  //     System.debug('Before Delete Running');
  //     InvoiceHandler__c triggerSwitch = InvoiceHandler__c.getInstance(UserInfo.getProfileId());
  //     if(triggerSwitch.bypassTrigger__c && System.isBatch())
  //     {
  //         System.debug('Batch Process will run and trigger will be prevented');
  //     }
  //     else{
  //         InvoiceHandler.restrictDeleteInvoices(Trigger.OldMap);
  //     }
  // }
  // if(Trigger.IsBefore && Trigger.IsUpdate)
  // {
  //     InvoiceHandler.restrictUpdate(Trigger.New, Trigger.OldMap);
  // }
  // // After Insert
  // if(Trigger.IsAfter && Trigger.IsInsert)
  // {
  //     InvoiceHandler.UpdateInvoice(Trigger.New, Null);
  // }
  // // After Update
  // if(Trigger.IsAfter && Trigger.IsUpdate)
  // {
  //     InvoiceHandler.UpdateInvoice(Trigger.New, Trigger.Oldmap);
  // }
}
