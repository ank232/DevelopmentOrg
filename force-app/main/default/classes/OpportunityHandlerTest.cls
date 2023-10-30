@isTest
public class OpportunityHandlerTest {
  @isTest
  static void testPopulatehighestOpp() {
    // Create test data
    Account testAccount1 = new Account(Name = 'Test Account 1');
    Account testAccount2 = new Account(Name = 'Test Account 2');
    insert new List<Account>{ testAccount1, testAccount2 };

    Opportunity testOpportunity1 = new Opportunity(
      Name = 'Opportunity 1',
      StageName = 'Prospecting',
      CloseDate = System.today(),
      Amount = 1000,
      AccountId = testAccount1.Id
    );
    Opportunity testOpportunity2 = new Opportunity(
      Name = 'Opportunity 2',
      StageName = 'Prospecting',
      Amount = 2000,
      CloseDate = System.today(),
      AccountId = testAccount1.Id
    );
    Opportunity testOpportunity3 = new Opportunity(
      Name = 'Opportunity 3',
      CloseDate = System.today(),
      StageName = 'Prospecting',
      Amount = 1500,
      AccountId = testAccount2.Id
    );
    insert new List<Opportunity>{
      testOpportunity1,
      testOpportunity2,
      testOpportunity3
    };

    // Call the method to be tested
    Test.startTest();
    OpportunityHandler.populatehighestOpp(
      new Map<Id, Opportunity>{
        testOpportunity1.Id => testOpportunity1,
        testOpportunity2.Id => testOpportunity2,
        testOpportunity3.Id => testOpportunity3
      },
      null
    );
    Test.stopTest();

    // Verify the results
    List<Account> updatedAccounts = [
      SELECT Id, Name, Description
      FROM Account
      WHERE Id IN :new Set<Id>{ testAccount1.Id, testAccount2.Id }
    ];
    System.assertEquals(2, updatedAccounts.size());

    for (Account acc : updatedAccounts) {
      if (acc.Name == 'Test Account 1') {
        System.assertEquals('Opportunity 2 --- 2000.00', acc.Description);
        System.debug(acc.Description);
      } else if (acc.Name == 'Test Account 2') {
        System.assertEquals('Opportunity 3 --- 1500.00', acc.Description);
      }
    }
  }
}
