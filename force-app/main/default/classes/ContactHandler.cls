public class ContactHandler {
  public static void updateContactonInsert(List<Contact> contactsToUpdate) {
    set<ID> accountIDs = new Set<Id>();
    for (contact conRec : contactsToUpdate) {
      if (conRec.accountID != null) {
        accountIDs.add(conRec.AccountId);
      }
    }
    list<contact> accountwithcons = [
      SELECT accountid, id, is_primary_contact__c
      FROM contact
      WHERE accountid IN :accountIDs
    ];
    map<id, list<contact>> acconmap = new Map<id, list<contact>>();
    if (!accountwithcons.isempty()) {
      for (contact conRec : accountwithcons) {
        if (!acconmap.containsKey(conRec.AccountID)) {
          acconmap.put(conRec.Accountid, new List<contact>());
        } else {
          acconmap.get(conRec.AccountId).add(conRec);
        }
      }
    }
  }
  public static void updateContact(
    List<Contact> contacstoUpdate,
    map<id, contact> oldContactmap
  ) {
  }
}
