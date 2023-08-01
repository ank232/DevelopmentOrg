public class AccountHandler {
    public static void updateAccount(set<ID> accountstoUpdate){
        list<Account>accountrecords = new List<Account>([
            Select id, name, AnnualRevenue from Account where ID in: accountstoUpdate
        ]);
        if(!accountrecords.isempty()){
            for(Account ac:accountrecords){
                ac.description = 'Account total revenue has changed to '+ ac.AnnualRevenue + 'at' + datetime.now();
            }
        }
        update accountrecords;
    }
    public static void RestrictDeleteonDraft(Map<Id, Account> DeletedAccounts){
        System.debug('Account to be deleted==>');
        List<Invoice__c> DraftInvs = [SELECT ID, Company__c,
                                      STATUS__C FROM Invoice__c WHERE Company__c IN: DeletedAccounts.keySet() AND 
                                      Status__c ='Draft'];
        Set<Id> accountswithDraftInv = new set<id>();
        if(!DraftInvs.isEmpty())
        {
            for(invoice__c inv: DraftInvs)
            {
                accountswithDraftInv.add(inv.Company__c);
            }
        }
        for(Account acc: DeletedAccounts.values())
        {
            if(accountswithDraftInv.contains(acc.Id))
            {
                acc.AddError('No you cannot delete this account');
            }
        }
    }
    
}