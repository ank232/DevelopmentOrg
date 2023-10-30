trigger TriggeronAccount on Account(after update, before delete, after delete) {
  if (Trigger.isAfter && Trigger.isupdate) {
    set<ID> accIds = new Set<ID>();
    for (account acRec : Trigger.new) {
      if (acRec.annualRevenue != Trigger.oldmap.get(acRec.id).annualRevenue) {
        accIds.add(acRec.ID);
      }
    }
    AccountHandler.updateAccount(accIds);
  }
  if (Trigger.isBefore && Trigger.isDelete) {
    AccountHandler.RestrictDeleteonDraft(Trigger.OldMap);
  }
}
