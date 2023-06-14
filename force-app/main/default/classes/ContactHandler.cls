public class ContactHandler {
    public static void updateContactonInsert(List<Contact> contactsToUpdate){
        set<ID> accountIDs = new set<Id>();
        for(contact conRec: contactsToUpdate){
            if(conRec.accountID!= null){
                accountIDs.add(conRec.AccountId);
            }
        }
        list<contact> accountwithcons = [select accountid,id, is_primary_contact__c from contact where accountid in: accountIDs];
map<id, list<contact>> acconmap = new map<id, list<contact>>();
        if(!accountwithcons.isempty()){
            for(contact conRec: accountwithcons){
                if(!acconmap.containsKey(conRec.AccountID)){
                    acconmap.put(conRec.Accountid, new List<contact>());
                }
                else{
                    acconmap.get(conRec.AccountId).add(conRec);
                }
            }
        }
    }
    public static void updateContact(List<Contact>contacstoUpdate, map<id, contact> oldContactmap){
    
    }
}