public with sharing class DumpClass {
  public static void UpdateMax() {
    Id ac1 = '0012w00001bcwf6AAA';
    id ac2 = '0012w00001OOKMjAAP';
    List<Id> ids = new List<id>{ ac1, ac2 };
    List<Account> accounts = [SELECT id, Name FROM Account WHERE Id IN :ids];
    List<Opportunity> opps = [
      SELECT AccountId, Description
      FROM Opportunity
      WHERE AccountId IN :ids
    ];
    for (Opportunity op : opps) {
      op.Description = 'Just Testing';
    }
    update opps;
  }
  public static void DoSomething() {
    Id ac1 = '0012w00001cWKxTAAW';
    id ac2 = '0012w00001OOKMhAAP';
    List<Id> ids = new List<id>{ ac1, ac2 };
    List<Account> accounts = [SELECT id, Name FROM Account WHERE Id IN :ids];
    System.debug(accounts);
    System.debug('****************************************');
    List<Invoice__c> invoices = [
      SELECT CUSTOMER__C, GRAND_TOTAL__C
      FROM INVOICE__C
      WHERE cOMPANY__C IN :ids AND Status__c != 'Paid'
    ];
    System.debug(invoices);
    for (Invoice__c inv : invoices) {
      inv.Comments__c = 'Testing using Dump Class';
    }
    update invoices;
  }
  public static void currencyModel() {
    Map<string, List<Invoice__c>> invoiceCurrencyMap = new Map<string, List<Invoice__c>>();
    List<invoice__c> invoices = [
      SELECT ID, CurrencyIsoCode, TOTAL_LINE_AMOUNT__C
      FROM INVOICE__C
      WHERE COMPANY__C = '0012w00001cWKxTAAW'
    ];
    for (Invoice__c inv : invoices) {
      if (invoiceCurrencyMap.containskey(inv.CurrencyIsoCode)) {
        invoiceCurrencyMap.get(inv.CurrencyIsoCode).add(inv);
      } else {
        invoiceCurrencyMap.put(inv.CurrencyIsoCode, new List<Invoice__c>());
      }
    }
    system.debug('inv Map');
    system.debug(invoiceCurrencyMap.keyset());
    for (String code : invoiceCurrencyMap.keyset()) {
      convertCurrency(invoiceCurrencyMap.get(code), code);
    }
  }
  public static void convertCurrency(List<invoice__c> invs, string code) {
    List<CurrencyType> ExchangeRates = [
      SELECT isoCode, conversionRate
      FROM currencyType
      WHERE isocode = :code
    ];
    for (invoice__c inv : invs) {
      system.debug('Amounts');
      system.debug(inv.Total_line_Amount__c);
      system.debug('converting to' + code);
      decimal rate = ExchangeRates[0].conversionRate;
      system.debug((Double) (rate * inv.total_Line_Amount__c));
    }
  }
  public static void currencyConverter(
    string fromCurrency,
    string toCurrency,
    decimal amnt
  ) {
    List<currencyType> c1 = Database.query(
      'SELECT IsoCode, ConversionRate from CurrencyType Where isoCode=:fromCurrency AND isoCode=: toCurrency'
    );
    system.debug(c1);
  }
}
