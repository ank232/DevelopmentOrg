@isTest
public class userPermissionTest {   
    @isTest 
    static void userPermissions()
    {
        String userName = 'testUser' + DateTime.now().getTime() + '@testorg.com';
        Profile recruiterProfile = [SELECT ID FROM PROFILE WHERE NAME = 'Recruiter'];
        User recruiter = new  User(
            Alias = 'testdt',
            Email = 'testuser@testorg.com',
            EmailEncodingKey ='UTF-8',
            LastName ='Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId =recruiterProfile.Id,
             TimeZoneSidKey = 'America/Los_Angeles',
            Username = userName
        );
        System.runAs(recruiter)
        {
            Account acc = new Account(Name ='Test Acc', Industry ='Banking');
            insert acc;
            Invoice__c inv = new Invoice__c(company__c = acc.Id,Invoice_Number__c ='INV121',Status__c ='Draft', Due_date__c = Date.today()+6,Invoice_date__c =Date.today());
            Boolean is = Schema.SObjectType.Invoice__c.fields.Status__c.IsCreateable();
            System.debug('=-=> '+ is);
            try{
                insert inv;                        
            }
            catch(DmlException e)
            {
                system.debug(e.getStackTraceString());
            }
            // List<invoice__c> relatedInvs = CustomerDetailsController.ShowInvoices(inv.Id);                        
            // System.assert(relatedInvs!=null);
        }
    }
}