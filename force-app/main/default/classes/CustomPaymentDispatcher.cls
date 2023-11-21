public class CustomPaymentDispatcher {
    public static void dispatch(System.TriggerOperation operationType)
    {
        switch on operationType {
            when BEFORE_INSERT {
                PaymentHandler.checkPaymentEligibility((List<Payment__c>) Trigger.new);                
            }
            when AFTER_INSERT{
                PaymentHandler.afterInsert((List<Payment__c>) Trigger.new);
            }
            when else {
                System.debug('Other Event called? '+ operationType);
            }
        }
    }
}