/*
 This class is used to insert Accounts requested through Rest Resource.....
 */
public with sharing class InsertRestAccounts {
  public static void UpdateAccs(List<Account> AccountsToUpate) {
    Set<Id> accountIDs = new Set<Id>();
    Database.UpsertResult[] updateRes = Database.upsert(
      AccountsToUpate,
      Account.Account_External_ID__c,
      false
    );
    for (database.UpsertResult res : updateRes) {
      if (res.getId() != null) {
        accountIDs.add(res.id);
        system.debug('Account Updated===' + res.id);
      } else {
        System.debug('Will do something');
      }
    }
  }
  public static void insertAccs(List<Account> AccountToAdd) {
    Set<ID> AccountIDs;
    if (!AccountToAdd.isEmpty()) {
      Database.SaveResult[] accountsInserted = Database.insert(AccountToAdd);
      for (Database.SaveResult res : accountsInserted) {
        AccountIDs.add(res.id);
        system.debug('Account----' + res.id);
      }
    }
  }
}
