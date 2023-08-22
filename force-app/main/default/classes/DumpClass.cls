public with sharing class DumpClass {
    public static void UpdateMax(){
         Id ac1 = '0012w00001bcwf6AAA';
    id ac2 = '0012w00001OOKMjAAP';
        List<Id> ids = new List<id>{ac1,ac2};
    List<Account> accounts = [SELECT id, Name from Account Where Id in: ids] ;
        List<Opportunity> opps  =[Select AccountId, Description from Opportunity where AccountId in: ids];
        for(Opportunity op: opps)
        {
            op.Description = 'Just Testing';
        }
        update opps;
}
    public static void DoSomething(){
          Id ac1 = '0012w00001cWKxTAAW';
    id ac2 = '0012w00001OOKMhAAP';
    List<Id> ids = new List<id>{ac1,ac2};
    List<Account> accounts = [SELECT id, Name from Account Where Id in: ids] ;
    System.debug(accounts);
    System.debug('****************************************');
    List<Invoice__c> invoices = [SELECT CUSTOMER__C, GRAND_TOTAL__C FROM INVOICE__C WHERE cOMPANY__C In: ids and Status__c!='Paid'];
    System.debug(invoices);
    for(Invoice__c inv: invoices)
    {
        inv.Comments__c = 'Testing using Dump Class';
    }
        Update invoices;
    }
}