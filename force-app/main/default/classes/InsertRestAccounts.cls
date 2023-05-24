/*
 This class is used to insert Accounts requested through Rest Resource.....
 */
public with sharing class InsertRestAccounts {
    
    public static void insertAccs(List<Account> AccountToAdd)
    {
        if(!AccountToAdd.isEmpty())
        {
            Database.SaveResult[] accountsInserted = Database.Insert(AccountToAdd);
            for(Database.SaveResult res: accountsInserted){   
                system.debug('Account----'+ res.id);
            }
        } 
    }
}