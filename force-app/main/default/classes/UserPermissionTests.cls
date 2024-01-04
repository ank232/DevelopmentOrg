@isTest
public class UserPermissionTests {
    @isTest
    static void checkGuestUserPermission() {
        User userToTest = InvoiceManagementTestDataFactory.createTestUser('InvoicePayment Profile');
        insert userToTest;
        Account guestUserShareAccount = new Account(name='Share Account',GuestUserAccess__c=true);      
        insert guestUserShareAccount;
        Invoice__c inv = new invoice__c(company__c =guestUserShareAccount.Id,status__c ='Draft',invoice_Number__c='34341',Due_Date__c=System.today(),Invoice_Date__c=system.today());
        insert inv;
        System.debug(userinfo.getProfileId());
        system.debug(guestUserShareAccount);
        System.runAs(userToTest) {            
            System.debug(userinfo.getName());
			payment__c pay  = new Payment__c(invoice__c=inv.Id,status__c='Draft',date__c=System.today());            
            insert pay;
            system.debug(pay);
        }
    }
}