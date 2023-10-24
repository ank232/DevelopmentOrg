public class CustomInvoiceDispatcher {
public static void dispatch(System.TriggerOperation operationType)
{
    switch on operationType {      
        when AFTER_UPDATE {
            InvoiceHandler.UpdateInvoice((List<Invoice__c>) Trigger.new, (Map<Id,Invoice__c>)Trigger.oldmap);    
        }
        when BEFORE_INSERT {
            InvoiceHandler.verifyInvoiceData((List<Invoice__c>) Trigger.new);
        }
        when BEFORE_UPDATE {
            InvoiceHandler.restrictUpdate((List<Invoice__c>) Trigger.new, (Map<Id,Invoice__c>) Trigger.oldMap);
        }             
        when BEFORE_DELETE {
            InvoiceHandler__c triggerSwitch = InvoiceHandler__c.getInstance(UserInfo.getProfileId());
            if(!System.isBatch() && !triggerSwitch.bypassTrigger__c){
                InvoiceHandler.restrictDeleteInvoices((Map<Id, Invoice__c>)Trigger.oldMap);
            }
        }
        when else {
            System.debug('OTHER OPERATION RUNNING');
        }
    }
}
}