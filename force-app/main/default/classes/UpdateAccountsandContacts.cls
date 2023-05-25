/*
Rest Resource class to update Accounts and its related contacts from PostMan
*/
@RestResource(UrlMapping='/UpdateAccountswithContacts')
global with sharing class UpdateAccountsandContacts 
{
    private static void ParseAccountsandContactsJson(Blob requestBody)
    {
        String blobToJson  = requestBody.toString();
       // system.debug('Data to Insert is'+ blobToJson);
        AccountContactsWrapper RestAccwithCons = (AccountContactsWrapper)JSON.deserialize(blobToJson, AccountContactsWrapper.class);

        List<AccountContactsWrapper.Accounts> accounts = RestAccwithCons.Accounts;

        Map<String, AccountContactsWrapper.Accounts> acsconMap  = new Map<String, AccountContactsWrapper.Accounts>();
        //system.debug('Account to Insert' + accounts);
        // Map<AccountContactsWrapper.Accounts, List<AccountContactsWrapper.Contacts>> wraperMap =
        //  new Map<AccountContactsWrapper.Accounts, List<AccountContactsWrapper.Contacts>>();
        for(AccountContactsWrapper.Accounts accWrapper: accounts)
        {
          // system.debug('Details===');
         //  system.debug('AccountEx_ID====='+accWrapper.ExternalID);
         //  system.debug('Contacts are-----'+  accWrapper.Contacts);
           //wraperMap.put(accwrapper, accWrapper.Contacts);
           acsconMap.put(accWrapper.ExternalID, accWrapper);
        }

        /*
        Map Iteration...
        */
        System.debug('Map- Keyset=='+ acsconMap.keyset());
        List<Account> accountsToInsert = new List<Account>();
        List<Contact> contactsToInsert = new List<Contact>();
        //for(AccountContactsWrapper.Accounts acs: acsconMap.keySet())
        for(String  mapVar: acsconMap.keySet())
        {
            //System.debug('MAP values========='+ acsconMap.get(mapVar).AccountName);
            // System.debug('Account ExtID ========='+ acsconMap.get(mapVar).ExternalID);
            // System.debug('Account Email ========='+ acsconMap.get(mapVar).emailAddress);
            //System.debug('Related Contacts for<<<<' + acsconMap.get(mapVar).AccountName +'>>>>is ====='+ acsconMap.get(mapVar).Contacts);// Its giving me the related contacts
            //System.debug('More Info on Contact------'+ acsconMap.get(mapVar).Contacts[0].Contact_ExternalID);
            /*====== *IMP(adding the desired Accounts and Contacts)======*/
            accountsToInsert.add(new Account(Name= acsconMap.get(mapVar).AccountName, Website=acsconMap.get(mapVar).EmailAddress));
            /*
            first insert the accounts then get the ids -> map the ids to its contact->insert the contact as well
            */
            set<ID> insertedAccIds = new Set<ID>();
            insertedAccIds=BeginAccountInsertion(accountsToInsert);
            system.debug('Account>>>'+ accountsToInsert);
            List<contact> contactsTestInsert  = new List<Contact>();
            for(AccountContactsWrapper.Contacts i: acsconMap.get(mapVar).Contacts)
            {
                contactsTestInsert.add(new Contact(
                    LastName= i.Last_Name, FirstName = i.First_Name,
                    Contact_ExternalID__c =i.Contact_ExternalID
                ));
           //     contactsToInsert.add(new Contact(LastName= i.Last_Name, FirstName=i.First_Name, Contact_ExternalID__c= i.Contact_ExternalID));
                //system.debug('Related Contacts are--');
            }
            system.debug('Contacts added are=='+ contactsTestInsert);

            //if(!accountsToInsert.isEmpty()){
            //insert accountsToInsert;
           // } // Accounts Inserted
            
            //System.debug('Related Cons===='+ acs.Contacts);
            // accountsToInsert.add(
            //         new Account(
            //         Name=acs.AccountName, 
            //         Account_External_Id__c = acs.ExternalID,
            //         Website  = acs.emailAddress
            //         ));
            // List<AccountContactsWrapper.Contacts> cons = acs.Contacts ;
            
            // for(AccountContactsWrapper.Contacts contact:cons)
            // {
            //     contactsToInsert.add(
            //         new Contact(
            //             FirstName = contact.First_Name,
            //             LastName  = contact.Last_Name
            //     )
            //     );
            // }
        }
        // System.debug('Accounts ready to insert are'+ accountsToInsert.size());
        // System.debug('Contacts ready to insert are'+contactsToInsert.size());
        //Set<ID> accountsInserted = new Set<Id>();
        //accountsInserted = InsertAccountAndCons(accountsToInsert, contactsToInsert); 
    }


    /*
     Rest Resouce:
    */ 

    @HttpPost
    global static void CreateAccountswithContacts()
    {
        RestRequest req = RestContext.request;
        RestResponse res  = RestContext.response;
        ParseAccountsandContactsJson(req.requestBody);
    }	

	private static Set<Id> InsertAccountAndCons(List<Account> accountsToInsert, List<Contact> contactsToInsert)
    { 
        Set<ID>accountInserted =  new Set<ID>();
        Database.SaveResult[] accountRes = Database.insert( accountsToInsert);
        for(Database.SaveResult result: accountRes)
        {
            if(result.getId()!= null)
            {
                accountInserted.add(result.id);
            }
        }        
        return accountInserted;
	} 
}