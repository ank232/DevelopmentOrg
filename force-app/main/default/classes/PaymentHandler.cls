public without sharing class PaymentHandler {
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
      for (payment__c paymentRec : payments) {        
        if (relatedInvs.containsKey(paymentRec.Invoice__c) && relatedInvs.get(paymentRec.Invoice__c).Status__c != 'Approved') {
          System.debug('Condition Satisfied?');
          paymentRec.addError('Payment must be made on Approved invoices');
        }
        if (relatedInvs.containsKey(paymentRec.Invoice__c) && relatedInvs.get(paymentRec.Invoice__c).Total_Line_Amount__c == 0.0) {
          paymentRec.addError('No LineItem found');
        }
      }
    }
  }
  /* This method will update the related invoice status to Paid */ 
  public static void afterInsert(List<Payment__c> payments)
  {
    Set<Id> invoiceIds = new Set<Id>();
    for(Payment__c  pay: payments)
    {
      invoiceIds.add(pay.Invoice__c);
    }
    if(! invoiceIds.isEmpty())
    {
      Map<Id, Invoice__c> relatedInvoices =new Map<Id, Invoice__c> ([Select Id, Status__c FROM Invoice__c WHERE Id IN: invoiceIds]);
      if(!relatedInvoices.isEmpty())
      {      for(Payment__c pay: payments)        
        {
          if(relatedInvoices.containskey(pay.Invoice__c))
          {
             relatedInvoices.get(pay.Invoice__c).Status__c = 'Paid';
          }
        }
      }
      try{
        update relatedInvoices.values();
      }catch(DmlException dmlEx)
      {
        System.debug('Not Done??');
        System.debug(dmlEx.getStackTraceString());                
        Error_Log__c errorLogger  = new Error_Log__c(Class_name__c = 'PaymentHandler',Stack_trace__c = dmlEx.getStackTraceString(),Error_message__c =dmlEx.getDmlMessage(0));
        insert errorLogger;
      }
    }
  }
}
