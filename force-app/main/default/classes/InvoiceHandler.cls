public with sharing class InvoiceHandler {
  private static string ORG_DEFAULT_CURRENCY_CODE;
  InvoiceHandler() {
    ORG_DEFAULT_CURRENCY_CODE = UserInfo.getDefaultCurrency();
  }
  private static List<String> FetchAllStatusPicklistVals() {
    String strObjectName = 'Invoice__c';
    String strPicklistField = 'Status__c';
    Map<String, String> mapPickListValues = new Map<String, String>();
    Schema.SObjectType objSobjectType = Schema.getGlobalDescribe()
      .get(strObjectName);
    Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe();
    Map<String, Schema.SObjectField> mapFields = objDescribeSobject.fields.getMap();
    List<Schema.PicklistEntry> lstPickListValues = mapFields.get(
        strPicklistField
      )
      .getDescribe()
      .getPickListValues();
    List<String> PicklistValues = new List<String>();
    for (Schema.PicklistEntry picklistVal : lstPickListValues) {
      PicklistValues.add(picklistVal.getValue());
    }
    return PicklistValues;
  }
  private static Map<Id, Map<String, Decimal>> MapProcessor(
    Map<Id, List<Invoice__c>> relatedInvoices
  ) {
    Set<Id> CompanyIds = relatedInvoices.keyset();
    Map<Id, Map<String, Decimal>> TotalAmntOnAccount = new Map<Id, Map<String, Decimal>>();
    for (Id companyId : CompanyIds) {
      List<Invoice__c> invoices = relatedInvoices.get(companyId);
      Map<String, Decimal> InvoiceGrandTotalByStatus = new Map<String, Decimal>();
      for (Invoice__c inv : invoices) {
        String InvoiceStatus = inv.Status__c;
        Decimal InvoiceTotalAmount = inv.Grand_Total__c;
        if (!InvoiceGrandTotalByStatus.containsKey(InvoiceStatus)) {
          InvoiceGrandTotalByStatus.put(InvoiceStatus, 0);
        }
        InvoiceGrandTotalByStatus.put(
          InvoiceStatus,
          InvoiceGrandTotalByStatus.get(InvoiceStatus) + InvoiceTotalAmount
        );
      }
      for (String statusVal : FetchAllStatusPickListVals()) {
        if (!InvoiceGrandTotalByStatus.containskey(statusVal)) {
          InvoiceGrandTotalByStatus.put(statusVal, 0);
        }
      }
      TotalAmntOnAccount.put(companyId, InvoiceGrandTotalByStatus);
    }
    return TotalAmntOnAccount;
  }
  /*
This method used to prevent prevent any update on paid Invoice, if that's already paid=> new copy->paid, old copy->paid
*/
  public static void restrictUpdate(
    List<Invoice__c> newInvoices,
    Map<Id, Invoice__c> oldInvoices
  ) {
    for (Invoice__c inv : newInvoices) {
      // System.debug('Collected Inv Status----' + inv.Status__c);
      // System.debug('old Inv Status-----' + oldInvoices.get(inv.Id).Status__c);
      if (
        oldInvoices.get(inv.Id).Status__c == 'Paid' &&
        inv.Status__c != 'Paid'
      ) {
        // System.debug('-=-=-=-=-=-=-=-==-=');
        // System.debug('New Status is '+ inv.Status__c);
        inv.AddError('Paid Invoices cannot be edited/updated');
      }
    }
  }
  /*
Method to restrict invoices which having status as Draft
*/
  public static void restrictDeleteInvoices(
    Map<Id, Invoice__c> InvoicesToDelete
  ) {
    // System.debug('I ran');
    Set<Id> invoiceIds = new Set<Id>();
    invoiceIds = InvoicesToDelete.keyset();
    List<Invoice__c> deletedInvoices = [
      SELECT ID, Company__c
      FROM Invoice__c
      WHERE Status__c = 'Draft' AND Id IN :invoiceIds
    ];
    if (!deletedInvoices.isEmpty()) {
      for (Invoice__c invoice : deletedInvoices) {
        InvoicesToDelete.get(invoice.Id)
          .addError(
            'This Invoice cannot be deleted since it is saved as Draft'
          );
      }
    }
  }
  /*
This method used calucate open, closed and overdue invoices on update
*/
  public static void UpdateInvoice(
    List<Invoice__c> newInvoices,
    Map<id, Invoice__c> oldInvoices
  ) {
    System.debug('I will update the invoices(after)');
    Set<Id> companyIds = new Set<Id>();
    Set<Id> invoiceIds = new Set<Id>();
    Map<Id, AggregateResult> InvoiceMap = new Map<Id, AggregateResult>();
    for (Invoice__c inv : newInvoices) {
      companyIds.add(inv.Company__c);
      invoiceIds.add(inv.Id);
    }
    Map<id, List<Invoice__c>> companyInvoicemap = new Map<id, List<invoice__c>>();
    if (!invoiceIds.isEmpty()) {
      List<Account> relatedCompanyList = new List<Account>(
        [
          SELECT
            id,
            (
              SELECT customer__c, status__c, grand_total__c
              FROM Invoices__r
            )
          FROM Account
          WHERE Id IN :companyIds
        ]
      );
      if (!relatedCompanyList.isEmpty()) {
        for (Account a : relatedCompanyList) {
          companyInvoicemap.put(a.id, a.Invoices__r);
        }
        Map<Id, Map<String, Decimal>> CompanyInvoicesTotal = MapProcessor(
          companyInvoicemap
        );
        if (!CompanyInvoicesTotal.isEmpty()) {
          List<Account> AccsToUpdate = new List<Account>();
          for (Id AccId : CompanyInvoicesTotal.keyset()) {
            Map<String, Decimal> invtotal = CompanyInvoicesTotal.get(AccId);
            Decimal PaidInvoiceTotal = invtotal.get('Paid');
            Decimal OverDueInvoiceTotal = invTotal.get('Pending');
            Decimal OpenInvoiceTotal =
              invtotal.get('Draft') +
              OverDueInvoiceTotal +
              invTotal.get('Approved');
            Account acc = new Account(
              Id = AccId,
              Open_Invoices__c = OpenInvoiceTotal,
              Paid_Invoices__c = PaidInvoiceTotal,
              OverDue_Invoices__c = OverDueInvoiceTotal
            );
            AccsToUpdate.add(acc);
          }
          if (!AccsToUpdate.isEmpty()) {
            update AccsToUpdate;
          }
        }
      }
    } else {
      System.debug('Ids are null');
    }
    // if(! System.isFuture())
    // {
    //     makeCalltoExchangeRateAPI(invoiceIds);
    // }
  }
  // Method to validae invoiceDate before Commiting to the system
  public static void verifyInvoiceData(List<Invoice__c> invoiceToBeverified) {
    set<id> customerIds = new Set<id>();
    for (Invoice__c inv : invoiceToBeverified) {
      customerIds.add(inv.Customer__c);
    }
    List<Invoice__c> rejectedInvoices = new List<Invoice__c>();
    for (invoice__c inv : invoiceToBeverified) {
      if (inv.Invoice_Date__c < System.today()) {
        inv.Adderror('Invoice Date should not be in past');
      }
    }
  }
  /*
Future method callout to external API to fetch lates exchange rates
*/
  @future(callout=true)
  public static void makeCalltoExchangeRateAPI(Set<Id> invoiceIds) {
    List<Invoice__c> preferredCurrencyonInvoice = new List<Invoice__c>();
    System.debug('Making callout to external API to set the exchange rates');
    List<Invoice__c> customerInvoices = new List<Invoice__c>(
      [
        SELECT
          company__r.Currency_Type__c,
          customer__r.Customer_s_Currency_Code__c,
          Invoice_Currency_Type__c
        FROM Invoice__c
        WHERE Id IN :invoiceIds
      ]
    );
    System.debug(customerInvoices.size());
    if (!customerInvoices.isEmpty()) {
      for (invoice__c inv : customerInvoices) {
        String companyCurrency = inv.company__r.Currency_Type__c;
        String customerCurrency = inv.customer__r.Customer_s_Currency_Code__c;
        if (
          (companyCurrency != null && customerCurrency != null) ||
          (companyCurrency != customerCurrency) // callout will only be made when both currencies are not null and not identical
        ) {
          String companyISocode = companyCurrency.split(',')[0];
          String customerISocode = customerCurrency.split(',')[0];
          // Map<String, Object> exchangeRateResponse =AlphaVantageService.latestRates(companyISocode, customerISocode);
          // Map<String,Object> obj =(Map<String,Object>) (exchangeRateResponse.get('Realtime Currency Exchange Rate'));
          // Double exchangeRate =(Double) obj.get('5. Exchange Rate');
          preferredCurrencyonInvoice.add(
            new Invoice__c(
              Id = inv.Id,
              Invoice_Currency_Type__c = customerISocode
            )
          );
        } else {
          System.debug('using the system default');
          system.debug('Acc- ' + inv.company__r.Currency_Type__c);
          system.debug('Con- ' + inv.customer__r.Customer_s_Currency_Code__c);
          preferredCurrencyonInvoice.add(
            new Invoice__c(
              Id = inv.Id,
              Invoice_Currency_Type__c = ORG_DEFAULT_CURRENCY_CODE //setting it to ORG DEFAULT
            )
          );
        }
      }
      try {
        update preferredCurrencyonInvoice;
      } catch (Exception e) {
        System.debug(e.getMessage());
        System.debug('Line->' + e.getLineNumber());
      }
    }
  }
}
