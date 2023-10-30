/* Trigger to update primary contact on account record, 
   if we select the new primary contact 
   the  checkbox on old primary contact must be uncheked. */
trigger TriggeronContact on Contact(after insert, after update) {
  if (Trigger.isafter && Trigger.isupdate) {
    ContactHandler.updateContact(Trigger.new, Trigger.oldmap);
  }
  if (Trigger.isinsert && Trigger.isafter) {
    ContactHandler.updateContactonInsert(Trigger.new);
  }
}
