trigger TriggerOnCustomRefund on Refund__c(before insert) {
  /*
    Before Trigger: 
    => verfying refund date:
    Cases-> 
            => 1. User create a payment and logged a refund on that
            => 2. There are multiple payments made and user looged the refund
    */

  if (Trigger.isBefore && Trigger.isInsert) {
    RefundHandler.checkrefundDate(Trigger.new);
  }
}
