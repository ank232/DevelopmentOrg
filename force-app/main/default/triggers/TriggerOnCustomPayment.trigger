trigger TriggerOnCustomPayment on Payment__c(after insert, before insert) {
  CustomPaymentDispatcher.dispatch(Trigger.OperationType);
}
