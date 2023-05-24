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
}