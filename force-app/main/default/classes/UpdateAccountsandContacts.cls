/*
Rest Resource class to update Accounts and its related contacts from PostMan
*/
@RestResource(UrlMapping='/UpdateAccountswithContacts')
global with sharing class UpdateAccountsandContacts {
  /* 
    Parsing Blob -> String -> Wrapper -> SObjects
  */
  private static void ParseAccountsandContactsJson(Blob requestBody) {
    /* 
        JSON Data
         */
    String blobToJson = requestBody.toString();
    AccountContactsWrapper RestAccwithCons = (AccountContactsWrapper) JSON.deserialize(
      blobToJson,
      AccountContactsWrapper.class
    );
    List<AccountContactsWrapper.Accounts> accounts = RestAccwithCons.Accounts;
    Map<String, AccountContactsWrapper.Accounts> acsconMap = new Map<String, AccountContactsWrapper.Accounts>();
    if (!accounts.isEmpty()) {
      for (AccountContactsWrapper.Accounts accWrapper : accounts) {
        String externalID = accWrapper.ExternalID;
        acsconMap.put(externalID, accWrapper);
      }
    }
    List<Contact> contactsToInsert = new List<Contact>();
    List<Account> accountsToInsert = new List<Account>();
    Map<string, List<Contact>> finalMap = new Map<string, List<Contact>>();
    system.debug('Account with its contacts are---');
    if (!acsconMap.isEmpty()) {
      for (String mapVar : acsconMap.keySet()) {
        accountsToInsert.add(
          new Account(
            Name = acsconMap.get(mapVar).AccountName,
            Website = acsconMap.get(mapVar).emailAddress,
            Account_External_ID__c = acsconMap.get(mapVar).ExternalID
          )
        );
        system.debug('Showing contacts----');
        system.debug(acsconMap.get(mapVar).Contacts);
        list<contact> cons = new List<Contact>();
        for (
          AccountContactsWrapper.Contacts con : acsconMap.get(mapVar).Contacts
        ) {
          string lastName = con.Last_Name;
          string firstName = con.First_Name;
          string conExternalId = con.Contact_ExternalID;
          contact conObj = new Contact(
            LastName = lastName,
            FirstName = firstName,
            Contact_ExternalID__c = conExternalId
          );
          cons.add(conObj);
          finalMap.put(mapVar, cons);
        }
      }
    }
    if (!accountsToInsert.isEmpty()) {
      insert accountsToInsert;
    }
    Map<String, ID> accountIDs = new Map<String, Id>();
    for (Account acc : accountsToInsert) {
      accountIDs.put(acc.Account_External_ID__c, acc.Id);
    }
    if (!finalMap.isEmpty()) {
      for (String AccexternalId : finalMap.keySet()) {
        ID accountID = accountIDs.get(AccexternalId);
        list<contact> contacts = finalMap.get(AccexternalId);
        for (contact con : contacts) {
          con.AccountId = accountID;
        }
        contactsToInsert.addall(contacts);
      }
      if (!contactsToInsert.isEmpty()) {
        insert contactsToInsert;
      }
    }
  }
  /*
   Rest Resouce:
   */
  @HttpPost
  global static String CreateAccountswithContacts() {
    RestRequest req = RestContext.request;
    RestResponse res = RestContext.response;
    if (res.responseBody != null) {
      ParseAccountsandContactsJson(req.requestBody);
      string Result = 'Accounts and Contacts Successfully Inserted into Salesforce';
      return Result;
    } else {
      return 'Bad Request';
    }
  }
}
