@isTest
public class InvoiceManagementTestDataFactory {
  public static Account createCompanyRecord(Boolean isInsert) {
    return createCompanyRecord('InvAcc1', isInsert);
  }
  public static Account createCompanyRecord(String acName, Boolean isInsert) {
    Account acc = new Account(Name = acName, Industry = 'Banking');
    if (isInsert) {
      insert acc;
    }
    return acc;
  }

  public static Contact createContactRecord(Boolean insInsert) {
    Account ac = createCompanyRecord(true);
    return createContactRecord(ac.Id, true);
  }
  public static Contact createContactRecord(Id accountId, Boolean isInsert) {
    contact customer = new Contact(
      firstName = 'Taco',
      LastName = 'Bell',
      accountId = accountId
    );
    if (isInsert) {
      insert customer;
    }
    return customer;
  }

  public static List<invoice__c> createInvoiceRecord(
    Id companyId,
    Id customerId,
    Integer totalinvoices
  ) {
    List<Invoice__c> invoices = new List<Invoice__c>();
    for (Integer i = 0; i < totalinvoices; i++) {
      Invoice__c inv = new Invoice__c(
        Invoice_Number__c = 'TestInvoice ' + i,
        customer__c = customerId,
        company__c = companyId,
        status__c = 'Draft',
        Invoice_date__c = Date.today(),
        Due_date__c = Date.today().addDays(6),
        Comments__c = 'Description ' + i
      );
      invoices.add(inv);
    }
    insert invoices;
    return invoices;
  }

  public static List<Invoice_Line_Items__c> createLinesItemsRecord(
    Id invoiceId,
    Integer totalLines,
    Id productId
  ) {
    List<Invoice_Line_Items__c> lineItems = new List<Invoice_Line_Items__c>();
    for (Integer i = 0; i < totalLines; i++) {
      Invoice_Line_Items__c item = new Invoice_Line_Items__c(
        Invoice__c = invoiceId,
        Unit_Amount__c = 1000,
        Quantity__c = 2,
        Tax__c = 3,
        Description__c = 'LineItem ' + i,
        product__c = productId,
        currencyIsoCode = 'USD'
      );
      lineItems.add(item);
    }
    insert lineItems;
    return lineItems;
  }
  public static List<Product2> createProductRecord(List<String> prodName) {
    List<Product2> products = new List<Product2>();
    for (integer i = 0; i < prodName.size(); i++) {
      Product2 product = new Product2(Name = prodName[i]);
      products.add(product);
    }
    insert products;
    return products;
  }
  public static Payment__c createPaymentRecord(
    Id invoiceId,
    double Amount,
    string paymentStatus,
    integer maxPaymentRec
  ) {
    Payment__c newPayment = new Payment__c(
      Invoice__c = invoiceId,
      Status__c = paymentStatus,
      Amount__c = Amount,
      Date__c = System.today() + 2
    );
    insert newPayment;
    return newPayment;
  }
  public static User createTestUser(string userProfile)
  {
     String uniqueUserName =
      'standarduser' +
      DateTime.now().getTime() +
      '@testorg.com';
    Profile guestUser = [
      SELECT Id
      FROM profile
      WHERE Name = 'InvoicePayment Profile'
    ];
    User testUser = new User(
      Alias = 'standt',
      Email = 'standarduser@testorg.com',
      EmailEncodingKey = 'UTF-8',
      LastName = 'Testing',
      LanguageLocaleKey = 'en_US',
      LocaleSidKey = 'en_US',
      ProfileId = guestUser.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      UserName = uniqueUserName
    );
    return testUser;
  }
}