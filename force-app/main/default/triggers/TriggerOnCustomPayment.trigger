trigger TriggerOnCustomPayment on Payment__c(after insert, before insert) {
  if (Trigger.isBefore && Trigger.isInsert) {
    PaymentHandler.checkPaymentDate(Trigger.new);
  }
  if (Trigger.isAfter && Trigger.isInsert) {
    PaymentHandler.updatePaymentDateonInvoice(Trigger.new);
  }
}
