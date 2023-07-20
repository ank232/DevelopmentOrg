@isTest
public class OpportunityHandlerTest {
    @isTest
    static void testPopulatehighestOpp() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Opportunity testOpportunity1 = new Opportunity(Name = 'Opportunity 1', Amount = 9000,
                                                       StageName= 'Qualification',
                                                       CloseDate = System.today(),
                                                       AccountId = testAccount.Id);
        Opportunity testOpportunity2 = new Opportunity(Name = 'Opportunity 2', Amount = 15000, 
                                                       CloseDate = System.today(),
                                                       StageName= 'Qualification',
                                                       AccountId = testAccount.Id);
        Opportunity testOpportunity3 = new Opportunity(Name = 'Opportunity 3', Amount = 7000, 
                                                       StageName ='Qualification',
                                                       CloseDate= System.today(),
                                                       AccountId = testAccount.Id);
        insert new List<Opportunity>{ testOpportunity1, testOpportunity2, testOpportunity3 };
            List<Opportunity> insertOpps = New List<opportunity>{testOpportunity1,testOpportunity2,testOpportunity3};
        // Call the method to be tested
        Test.startTest();
        OpportunityHandler.populatehighestOpp(insertOpps, null);
        Test.stopTest();

        // Retrieve the updated account
        Account updatedAccount = [SELECT Description FROM Account WHERE Id = :testAccount.Id];

        // Assert the results
        System.debug(updatedAccount.Description);
    }
}