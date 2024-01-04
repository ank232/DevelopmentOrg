@RestResource(urlMapping='/stripe/webhook/v1/*')
global without sharing class StripeWebHook {
    private static final string SIGNATURE_VALID = 'Signature Verified';
    private static final string SIGNATURE_INVALID = 'Signature Invalid';    
    @HttpPost
    global static void doPost() {        
        RestResponse response = RestContext.response;
        response.addHeader('Content-Type', 'application/json');
        String responseString = RestContext.request.requestBody.toString();
        String validResponse = validateStripeSign(RestContext.request,responseString);
        if (validResponse != SIGNATURE_VALID) {
          response.responseBody = Blob.valueOf('{success: false, event:"Unkown:","message"' + validResponse + '"}');
          response.statusCode = 401;
          return;
        }         
            Map<String, Object> stripePaymentData = (Map<String, Object>) JSON.deserializeUntyped(responseString);
            System.debug(System.LoggingLevel.DEBUG, '** ' + responseString);
            String eventType = String.valueOf(stripePaymentData.get('type'));
            switch on eventType {
                when 'checkout.session.completed' {
                    Map<String, Object> wrapper = (Map<String, Object>) stripePaymentData.get('data');
                    StripeCheckoutwrapper stripecheckoutData = (StripeCheckoutwrapper) JSON.deserialize(JSON.serialize(wrapper.get('object')),StripeCheckoutwrapper.class);
                    String invoiceId = stripecheckoutData.metadata.invoiceId;                    
                    String customerEmail = stripecheckoutData.customer_details.email;
                    integer paidAmount = stripecheckoutData.amount_total;
                    Decimal amountConverted = paidAmount / 100;
                    String referenceId = stripecheckoutData.payment_intent;
                    if(!String.isBlank(invoiceId))
                    {
                      String paymentRecId = invoiceId.substring(invoiceId.length() - 4,invoiceId.length());
                      Payment__c newPayment= new Payment__c(
                        invoice__c  = invoiceId,
                        amount__c = amountConverted,
                        Date__c = date.today(),
                        Status__c = 'Processed',
                        comments__c = 'Successfull payment from stripe',
                        Reference_Number__c = referenceId
                      );
                      try{
                        insert  newPayment;
                        response.statusCode = 200;
                        response.responseBody = Blob.valueOf('success: true, "event": "payment recieved for invoice"}');
                      }catch(DmlException dmlEx)
                      {
                        System.debug('DML exeption while inserting payment Record');
                        response.statusCode = 400;
                        response.responseBody = Blob.valueOf('success: true, "event": "payment not recieved for invoice"}');
                      }
                      String emailBody = '<html><body>';
                      emailBody +=
                      '<p>Payment of ' +
                      paidAmount +
                      ' has been received against Invoice ' +
                      invoiceId +
                      ' Please get your purchase reciept.</p>';
                      emailBody += '<p>Thank you for your payment!</p>';
                      emailBody += '<p> BillZen</p>';
                      emailBody += '</body></html>';
                      CustomerDetailsController.sendStripePaymail(customerEmail,emailBody,'Payment Successful');                   
                    }                    
                }        
                when 'charge.succeeded' {                    
                    Map<String, Object> data = (Map<String, Object>) stripePaymentData.get('data');
                    StripePaymentWrapper paymentData = (StripePaymentWrapper) JSON.deserialize(JSON.serialize(data.get('object')),StripePaymentWrapper.class);
                    Integer amount = paymentData.amount;
                    amount /= 100;
                    String recieptUrl = paymentData.receipt_url;
                    String recieptEmail = paymentData.billing_details.email;
                    String emailBody = '<html><body>';
                    emailBody +=
                        '<p>Payment of ' +
                        amount +
                        ' has been received. ' +
                        ' Please get your purchase reciept.</p>';
                    emailBody +=
                        '<a href="' +
                        recieptUrl +
                        '" style="display: inline-block; background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none;">View Receipt</a>';
                    emailBody += '<p>Thank you for your payment!</p>';
                    emailBody += '</body></html>';
                    response.responseBody = Blob.valueOf('{success: true, event: "Charge Recieved"}');
                    response.statusCode = 200;
                    CustomerDetailsController.sendStripePaymail(recieptEmail,emailBody,'Stripe Payment Reciept');
                }
                when 'product.created' {          
                    Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
                        'data'
                    );
                    system.debug(data);
                }
                when 'product.updated' {          
                    Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
                        'data'
                    );
                    StripeProductWrapper wrapper = (StripeProductWrapper) JSON.deserialize(
                        JSON.serialize(data.get('object')),
                        StripeProductWrapper.class
                    );
                    Product2 stripeProduct = new Product2(
                        name = wrapper.name,
                        Description = 'Added From Stripe',
                        Stripe_Product_Id__c = wrapper.id,
                        currencyIsoCode = 'USD',
                        IsActive = true,
                        Stripe_Price_Id__c = wrapper.default_price
                    );
                    Database.upsert(stripeProduct, Product2.Stripe_Product_Id__c, false);
                    response.statusCode = 200;
                    response.responseBody = Blob.valueOf(
                        'success:true,"event":"Product Upserted In Salesforce"'
                    );
                }
                when 'payment_intent.created' {          
                }
                when 'payment_intent_succeeded' {          
                }
                when 'payment_intent.requires_action' {          
                }
                when else {
                    System.debug(eventType);            
                }
            }        
    }
    private static String validateStripeSign(RestRequest request,String responseString) {
        Map<String, String> headers = request.headers;
        String signNature = headers.get('Stripe-Signature');    
        Map<String, string> singKeys = new Map<String, String>();
        List<String> signatures = signNature.split(',');
        for (String stripekeys : signatures) {
            singKeys.put(stripekeys.split('=')[0], stripekeys.split('=')[1]);
        }
        String signature_payload = singKeys.get('t') + '.' + responseString;
        Blob input = Blob.valueOf(signature_payload);
        Blob privateKey = Blob.valueOf(System.Label.StripeWebhookSignature);
        Blob hmac = Crypto.generateMac('HmacSHA256', input, privateKey);
        String incomingSignature = singKeys.get('v1');    
        String response = (incomingSignature == EncodingUtil.convertToHex(hmac))? 'Signature Verified': 'Not Verified';
        return response;  
    }
    @httpGet
    global static String doGet() {
        return '{"messsage": "Test Webhook for Stripe}';
    }    
    global class SendEmailWrapper {
        @invocableVariable(required=true)
        public string recieptUrl;
        @invocableVariable(required=true)
        public integer amount;
    }
}