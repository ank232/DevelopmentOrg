trigger TriggerOnCustomPayment on Payment__c (after insert) 
{
    if(Trigger.isAfter && Trigger.isInsert)
    {
        PaymentHandler.updatePaymentDateonInvoice(Trigger.new);
    }
}