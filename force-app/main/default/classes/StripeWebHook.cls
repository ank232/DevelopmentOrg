@RestResource(urlMapping='/stripe/webhook/v1/*')
global without sharing class StripeWebHook {
  private static final string SIGNATURE_VALID = 'Signature Verified';
  private static final string SIGNATURE_INVALID = 'Signature Invalid';
  @HttpPost
  global static void doPost() {
    System.debug('USER RUNNING::: ' + UserInfo.getProfileId());
    RestResponse response = RestContext.response;
    response.addHeader('Content-Type', 'application/json');
    String responseString = RestContext.request.requestBody.toString();
    String validResponse = validateStripeSign(
      RestContext.request,
      responseString
    );
    if (validResponse != SIGNATURE_VALID) {
      response.responseBody = Blob.valueOf(
        '{success: false, event:"Unkown:","message"' + validResponse + '"}'
      );
      response.statusCode = 401;
      return;
    } else {
      Map<String, Object> stripePaymentData = (Map<String, Object>) JSON.deserializeUntyped(
        responseString
      );
      System.debug(System.LoggingLevel.DEBUG, '** ' + responseString);
      String eventType = String.valueOf(stripePaymentData.get('type'));
      switch on eventType {
        when 'checkout.session.completed' {
          Map<String, Object> wrapper = (Map<String, Object>) stripePaymentData.get(
            'data'
          );
          // Map<String, Object> checkoutData = (Map<String, Object>) wrapper.get(
          //   'object'
          // );
          StripeCheckoutwrapper stripecheckoutData = (StripeCheckoutwrapper) JSON.deserialize(
            JSON.serialize(wrapper.get('object')),
            StripeCheckoutwrapper.class
          );
          // String invoiceId = stripecheckoutData.metadata.invoiceId;
          StripeCheckoutwrapper.metadata meta = new StripeCheckoutwrapper.metadata();
          meta = stripecheckoutData.metadata;
          String customerEmail = stripecheckoutData.customer_details.email;
          integer paidAmount = stripecheckoutData.amount_total;
          Decimal amountConverted = paidAmount / 100;
          String referenceId = stripecheckoutData.payment_intent;
          System.debug('Metadata?? ' + meta);
          if (meta.invoiceId != null) {
            System.debug('Got invoiceId ??');
            try {
              String paymentRecId = meta.invoiceId.substring(
                meta.invoiceId.length() - 4,
                meta.invoiceId.length()
              );
              Payment__c payment = new Payment__c(
                invoice__c = meta.invoiceId,
                name = 'StripePay' + paymentRecId,
                amount__c = paidAmount,
                Status__c = 'Processed',
                Date__c = date.today(),
                comments__c = 'Successfull payment from stripe',
                Reference_Number__c = referenceId
              );
              insert payment;
              response.statusCode = 200;
              response.responseBody = Blob.valueOf(
                'success: true, "event": "payment recieved for invoice"}'
              );
              String emailBody = '<html><body>';
              emailBody +=
                '<p>Payment of ' +
                paidAmount +
                ' has been received against Invoice ' +
                meta.invoiceId +
                ' Please get your purchase reciept.</p>';
              emailBody += '<p>Thank you for your payment!</p>';
              emailBody += '<p> BillZen</p>';
              emailBody += '</body></html>';
              CustomerDetailsController.sendStripePaymail(
                customerEmail,
                emailBody,
                'Payment Successful'
              );
            } catch (DmlException e) {
              System.debug('Some Error in inserting payment Record');
              System.debug(e.getStackTraceString());
              response.statusCode = 401;
              response.responseBody = Blob.valueOf(
                '{success: false, event: "Invoice Was not approved"}'
              );
            }
          }
        }
        when 'charge.succeeded' {
          // System.debug(System.LoggingLevel.DEBUG, '****=> \n' + responseString);
          Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
            'data'
          );
          StripePaymentWrapper paymentData = (StripePaymentWrapper) JSON.deserialize(
            JSON.serialize(data.get('object')),
            StripePaymentWrapper.class
          );
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
          response.responseBody = Blob.valueOf(
            '{success: true, event: "Charge Recieved"}'
          );
          response.statusCode = 200;
          CustomerDetailsController.sendStripePaymail(
            recieptEmail,
            emailBody,
            'Stripe Payment Reciept'
          );
        }
        when 'product.created' {
          System.debug('Product Created In stripe');
          system.debug(responseString);
          Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
            'data'
          );
          system.debug(data);
        }
        when 'product.updated' {
          System.debug('Product Update Recieved');
          System.debug(LoggingLevel.DEBUG, responseString);
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
          System.debug('Payment Intent Created!');
        }
        when 'payment_intent_succeeded' {
          System.debug('Payment Intent Succeeded!');
        }
        when 'payment_intent.requires_action' {
          System.debug('Payment Intent Requires action!');
        }
        when else {
          System.debug(eventType);
        }
      }
    }
  }
  private static String validateStripeSign(
    RestRequest request,
    String responseString
  ) {
    Map<String, String> headers = request.headers;
    String signNature = headers.get('Stripe-Signature');
    // SYstem.debug(System.LoggingLevel.DEBUG, '--- ' + signNature);
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
    // System.debug(System.LoggingLevel.DEBUG, '-@@@@-- ' + incomingSignature);
    String response = (incomingSignature == EncodingUtil.convertToHex(hmac))
      ? 'Signature Verified'
      : 'Not Verified';
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
