public with sharing class DumpClass {
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
    public static void aggrRes(){
        Id ac1 = '0012w00001cWKxTAAW';
      List<AggregateResult> invoices = [SELECT Count(company__c), Status__c,Sum(GRAND_TOTAL__C) FROM INVOICE__C WHERE cOMPANY__C=: ac1 group by Status__c];
        for(AggregateResult red: invoices)
        {
            System.debug(red);
        }
    }
}