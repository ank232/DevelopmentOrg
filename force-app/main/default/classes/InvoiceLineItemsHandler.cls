public class InvoiceLineItemsHandler {
  public static void PreventDeleteOnPaidInvoice(
    Map<Id, Invoice_Line_Items__c> delLineItems
  ) {
    System.debug('I will prevent delete of lineItem on Paid Invoices');
    Set<Id> invoiceIds = new Set<Id>();
    for (Invoice_Line_Items__c lineItem : delLineItems.values()) {
      invoiceIds.add(lineItem.Invoice__c);
    }
    Map<Id, Invoice__c> invoices = new Map<Id, Invoice__c>(
      [
        SELECT Id, Status__c
        FROM Invoice__c
        WHERE Id IN :invoiceIds AND Status__c = 'Paid'
      ]
    );
    for (Invoice_Line_items__c item : delLineItems.values()) {
      if (invoices.containskey(item.Invoice__c)) {
        System.debug(
          'Invoice--=Status->' + invoices.get(item.invoice__c).Status__c
        );
        item.addError(
          'This Line Item is related to a paid invoice and cannot be deleted'
        );
      }
    }
  }
  /* Method to Prevent Modification on LineiTem if the invoice is Paid */
  public static void PreventEditOnLineItem(
    Map<Id, Invoice_line_Items__c> lineItems
  ) {
    Set<id> invoiceHavingLines = new Set<id>();
    for (Id lineId : lineItems.keyset()) {
      invoiceHavingLines.add(lineItems.get(lineId).Invoice__c);
    }
    if (!invoiceHavingLines.isEmpty()) {
      Map<Id, Invoice__c> inv = new Map<Id, Invoice__c>(
        [
          SELECT currencyIsoCode, ID, NAME, Status__c
          FROM INVOICE__c
          WHERE Id IN :invoiceHavingLines
        ]
      );
      for (Invoice_Line_Items__c lines : lineItems.values()) {
        if (
          inv.get(lines.Invoice__c) != null &&
          inv.get(lines.Invoice__c).Status__c == 'Paid'
        ) {
          lines.addError('Invoice is paid, you cannot edit anything');
          //   throw new AuraHandledException('Invoice is paid, you cannot edit anything');
        }
        // lines.CurrencyIsoCode = inv.get(lines.Invoice__c).currencyISOcode;
      }
    }
  }
  // Method to prevent addition of invoice lines when invoice status is Paid
  public static void PreventInsertofLinesOnPaidInvoice(
    List<Invoice_Line_Items__c> lineItems
  ) {
    Set<Id> invoiceIds = new Set<Id>();
    for (Invoice_Line_Items__c line : lineItems) {
      invoiceIds.add(line.Invoice__c);
    }
    Map<Id, Invoice__c> invoices = new Map<Id, Invoice__c>(
      [
        SELECT Id, Status__c, CurrencyIsoCode
        FROM Invoice__c
        WHERE ID IN :invoiceIds
      ]
    );
    if (!invoices.isEmpty()) {
      for (Invoice_Line_Items__c lineItem : lineItems) {
        if (invoices.containskey(lineItem.Invoice__c)) {
          if ((invoices.get(lineItem.Invoice__c).Status__c == 'Paid')) {
            lineItem.addError('Cannot add new lineItem on Paid Invoice');
          }
          lineItem.CurrencyIsoCode = invoices.get(lineItem.Invoice__c)
            .currencyISOcode;
        }
      }
    }
  }
}
