public with sharing class InvoicePaymentAction {
  // @invocableMethod(label='Apex Invocation')
  // public static List<String> sendFlowMessage(){
  //     return new List<String>{'Called From Apex'};
  // }
  /*
    developed by: @ank232
    Purpose: Invocable method to create the payment link for the invoice
    @inputParams: invoiceid,lineItems[quantity,stripePriceId],status,
    @returns: stripePayment URL
    */
  @invocableMethod(label='Stripe Url gen')
  public static List<string> stripePaymentLinkAction(List<PaymentModalWrapper> inputParams) {
    // string url = StripeService.createStripePayment(string.valueOf(inputParams));
    // system.debug('**' + url);
    return new List<String>{ 'Test url' };
  }
}
