trigger TriggeronAccount on Account (after update, before delete,after delete) {
    if(trigger.isAfter && trigger.isupdate){
    set<ID> accIds = new set<ID>();
        for(account acRec: trigger.new){
            if(acRec.annualRevenue != trigger.oldmap.get(acRec.id).annualRevenue){
            accIds.add(acRec.ID);
            }
        }
        AccountHandler.updateAccount(accIds);    
    }
    if(Trigger.isBefore && Trigger.isDelete)
    {
        AccountHandler.RestrictDeleteonDraft(Trigger.OldMap);
    }
}