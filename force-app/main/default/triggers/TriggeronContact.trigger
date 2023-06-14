/* Trigger to update primary contact on account record, 
   if we select the new primary contact 
   the  checkbox on old primary contact must be uncheked. */
trigger TriggeronContact on Contact (after insert, after update) {
    if(trigger.isafter && trigger.isupdate){
        ContactHandler.updateContact(trigger.new, trigger.oldmap);
    }
    if(trigger.isinsert && trigger.isafter){
        ContactHandler.updateContactonInsert(trigger.new);
    }
}