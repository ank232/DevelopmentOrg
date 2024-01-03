public with sharing class CustomerDetailsController {
  @AuraEnabled(cacheable=true)
  public static List<Invoice__c> ShowInvoices(string companyId) {
    try {
      List<Invoice__c> invoices = [
        SELECT
          Id,
          Name,
          Customer__r.FirstName,
          Customer__r.LastName,
          Due_Date__c,
          Invoice_Date__c,
          Status__c,
          Total_Line_Amount__c,
          CurrencyIsoCode
        FROM invoice__c
        WHERE Company__c = :companyId
        WITH SECURITY_ENFORCED
      ];
      return Invoices;
    } catch (Exception e) {
      System.debug(e.getMessage());
      throw new AuraHandledException(e.getMessage());
    }
  }
  /*
    Method to return Related Contacts of an account
    @params: String-> CompanyId
    */
  @AuraEnabled(cacheable=true)
  public static List<Contact> RelatedContacts(
    string CompanyId,
    String searchterm
  ) {
    string searchquery = '%' + searchterm + '%';
    try {
      List<Contact> relatedCustomers = [
        SELECT Id, NAME
        FROM CONTACT
        WHERE ACCOUNTID = :CompanyId AND NAME LIKE :searchquery
      ];
      if (!relatedCustomers.isEmpty()) {
        return relatedCustomers;
      } else if (relatedCustomers.isEmpty()) {
        return relatedCustomers;
      } else {
        throw new AuraHandledException('No Customers Found');
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Contact> AllCustomers(string CompanyId) {
    try {
      List<Contact> allContacts = [
        SELECT
          NAME,
          Phone,
          EMAIL,
          MailingStreet,
          MailingCity,
          MailingState,
          MailingCountry,
          CurrencyIsoCode
        FROM CONTACT
        WHERE AccountId = :CompanyId
      ];
      if (!allContacts.isEmpty()) {
        return allContacts;
      } else if (allContacts.isEmpty()) {
        return allContacts;
      } else {
        throw new AuraHandledException('No contact Found');
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(Cacheable=true)
  public static Account InvoicesTotal(String companyId) {
    try {
      string query = 'SELECT Open_Invoices__c, Paid_Invoices__c, OverDue_Invoices__c FROM ACCOUNT WHERE ID =: companyId';
      Account getInvoices = Database.query(query);
      return getInvoices;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static List<Product2> productSearch(string ProductName) {
    string searchTerm = '%' + ProductName + '%';
    try {
      List<Product2> products = [
        SELECT ID, Name
        FROM PRODUCT2
        WHERE NAME LIKE :searchTerm
      ];
      return products;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static List<Invoice_Line_Items__c> RelatedLineItems(Id invoiceId) {
    try {
      List<Invoice_line_Items__c> LineItems = [
        SELECT
          product__c,
          product__r.Name,
          description__c,
          Invoice__r.Status__c,
          currencyIsoCode,
          tax__c,
          tax_type__c,
          Tax_Amount__c,
          unit_Amount__c,
          Total_Amount__c,
          Product__r.Stripe_Product_Id__c,
          Product__r.Stripe_Price_Id__c,
          Quantity__c
        FROM INVOICE_LINE_ITEMS__c
        WHERE invoice__c = :invoiceId
        WITH SECURITY_ENFORCED
      ];
      return LineItems;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled(cacheable=true)
  public static CurrencyType currencyType(string currencyCode) {
    string code = currencyCode;
    if (code == null) {
      currencyCode = 'USD';
    }
    code = currencyCode;
    try {
      string query = 'SELECT ISoCode, ConversionRate from CurrencyType where isoCode=: code';
      CurrencyType latestRate = Database.query(query);
      return latestRate;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  public static decimal currencyConvertor(
    String fromCurrencyCode,
    String toCurrencyCode
  ) {
    System.debug('Converting ' + fromCurrencyCode + 'to ' + toCurrencyCode);
    decimal rateConverted = 1;
    CurrencyType fromCurrency = [
      SELECT ConversionRate, IsoCode
      FROM CurrencyType
      WHERE IsoCode = :fromCurrencyCode
      LIMIT 1
    ];
    CurrencyType toCurrency = [
      SELECT ConversionRate, IsoCode
      FROM CurrencyType
      WHERE IsoCode = :toCurrencyCode
      LIMIT 1
    ];
    if (fromCurrency != null && toCurrency != null) {
      // Calculate the converted amount
      system.debug(
        'Converted Rate from ' +
          fromCurrency.IsoCode +
          ' to ' +
          toCurrency.IsoCode +
          ' ==== ' +
          (toCurrency.ConversionRate / fromCurrency.ConversionRate)
      );
      rateConverted = (toCurrency.ConversionRate / fromCurrency.ConversionRate);
      system.debug('*** Conversion Rate is ' + rateConverted.setScale(4));
      return rateConverted;
    }
    return rateConverted;
  }
  /*    
  Method to send Email when a payment been made against the invoice  
  */ 
  public static void sendStripePaymail(string customerEmail, string emailContent, string emailSubject)
  {   
    OrgWideEmailAddress orgEmail = [SELECT ID FROM OrgWideEmailAddress WHERE DisplayName = 'Org EMAIL' LIMIT 1];
    string fromEmail =orgEmail.Id;
    string[] to = new List<String>{customerEmail};
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    email.setSubject(emailSubject);
    email.setHtmlBody(emailContent);
    email.setOrgWideEmailAddressId(fromEmail);
    email.setToAddresses(to);
    email.setSaveAsActivity(true);    
    // Messaging.SendEmailResult[] emailDeliverabily = Messaging.sendEmail(new List<Messaging.SingleEmailMessage> {email});
    // for (Messaging.SendEmailResult result : emailDeliverabily) {
    //     if (!result.isSuccess()) {
    //       System.debug('Not DONE: ' + result.getErrors());
    //     } else {
    //       System.debug('SENT!');
    //       System.debug(result);
    //     }
    //   }
  }
  }