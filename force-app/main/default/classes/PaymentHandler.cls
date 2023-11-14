public with sharing class PaymentHandler {
  public static void checkPaymentEligibility(List<Payment__c> payments) {
    System.debug('Trigger Runnin in Before for Payment(custom)');
    System.debug('USER RUNNING Trigger::: ' + UserInfo.getProfileId());
    set<Id> invoiceIds = new Set<Id>();
    for (Payment__c pay : payments) {
      if (pay.Invoice__c != null) {
        invoiceIds.add(pay.Invoice__c);
      }
    }
    System.debug('IDS collected>> ' + invoiceIds);
    if (!invoiceIds.isEmpty()) {
      Map<Id, Invoice__c> relatedInvs = new Map<Id, Invoice__c>(
        [
          SELECT ID, Status__c, Total_Line_Amount__c
          FROM Invoice__c
          WHERE Id IN :invoiceIds
        ]
      );
      system.debug('RelatedINV: ' + relatedInvs);
      for (payment__c paymentRec : payments) {
        System.debug('Inside Loop?');
        System.debug(paymentRec);
        if (
          relatedInvs.containsKey(paymentRec.Invoice__c) &&
          relatedInvs.get(paymentRec.Invoice__c).Status__c != 'Approved'
        ) {
          System.debug('Condition Satisfied?');
          paymentRec.addError('Payment must be made on Approved invoices');
        }
        if (
          relatedInvs.containsKey(paymentRec.Invoice__c) &&
          relatedInvs.get(paymentRec.Invoice__c).Total_Line_Amount__c == 0.0
        ) {
          paymentRec.addError('No LineItem found');
        }
      }
    }
  }
}
