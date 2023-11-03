@RestResource(urlMapping='/stripe/webhook/v1/*')
global without sharing class StripeWebHook {
  private static final string SIGNATURE_VALID = 'Signature Verified';
  private static final string SIGNATURE_INVALID = 'Signature Invalid';
  @HttpPost
  global static void doPost() {
    RestResponse response = RestContext.response;
    response.addHeader('Content-Type', 'application/json');
    String responseString = RestContext.request.requestBody.toString();
    String validResponse = validateStripeSign(
      RestContext.request,
      responseString
    );
    System.debug(System.LoggingLevel.DEBUG, 'IS VALID? ' + validResponse);
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
          Map<String, Object> checkoutData = (Map<String, Object>) wrapper.get(
            'object'
          );
          string metadata = String.valueOf(checkoutData.get('metadata'));
          List<String> res = metadata.split('=');
          string invoiceId = res[1].remove('}');
          response.statusCode = 200;
          response.responseBody = Blob.valueOf(
            '{success: true, event: "Checkout Completed?"}'
          );
          String amountVal = String.valueOf(checkoutData.get('amount_total'));
          Decimal amount = Decimal.valueOf(amountVal);
          amount = amount / 100;
          // sendStripeReciept(amount, '', invoiceId);
          sendSuccsessMail(amount,invoiceId);
        }
        when 'charge.succeeded' {
          System.debug(System.LoggingLevel.DEBUG, '****=> \n' + responseString);
          Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
            'data'
          );
          StripePaymentWrapper paymentData = (StripePaymentWrapper) JSON.deserialize(
            JSON.serialize(data.get('object')),
            StripePaymentWrapper.class
          );
          Integer amount = paymentData.amount;
          String reciept = paymentData.receipt_url;
          response.responseBody = Blob.valueOf(
            '{success: true, event: "Charge Recieved"}'
          );
          response.statusCode = 200;
          sendStripeReciept(amount, reciept);
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
    SYstem.debug(System.LoggingLevel.DEBUG, '--- ' + signNature);
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
    System.debug(System.LoggingLevel.DEBUG, '-@@@@-- ' + incomingSignature);
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
  public static void sendSuccsessMail(decimal amount, string invoiceId)
  {
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    email.setSubject('Payment Successful');
    string userEmail = UserInfo.getUserEmail();
        List<OrgWideEmailAddress> orgEmail = [
      SELECT Id
      FROM OrgWideEmailAddress
      WHERE DisplayName = 'Org EMAIL'
      LIMIT 1
    ];
    string fromEmail = orgEmail[0].Id;
    string[] to = new List<string>{ 'ankurtrivediakku@gmail.com' };
    email.setToAddresses(to);
    email.setOrgWideEmailAddressId(fromEmail);
    email.setSaveAsActivity(false);
    email.setTargetObjectId(UserInfo.getUserId());
    String emailBody = '<html><body>';
    emailBody +=
      '<p>Payment of ' +
      amount +
      ' has been received against InvoiceNo. ' +
      invoiceId +
      ' Please get your purchase reciept.</p>';          
    emailBody += '<p>Thank you for your payment!</p>';
    emailBody += '<p> BillZen</p>';
    emailBody += '</body></html>';
    email.setHtmlBody(emailBody);
    try {
      System.debug(
        System.LoggingLevel.DEBUG,
        'USED LIMIT? ' + Limits.getEmailInvocations()
      );
      Messaging.SendEmailResult[] res = Messaging.sendEmail(
        new List<Messaging.SingleEmailMessage>{ email }
      );
      for (Messaging.SendEmailResult result : res) {
        if (!result.isSuccess()) {
          System.debug('Not DONE: ' + result.getErrors());
        } else {
          System.debug('SENT!');
          System.debug(result);
        }
      }
    } catch (Exception e) {
      System.debug(System.LoggingLevel.ERROR, e.getMessage());
      System.debug(
        System.LoggingLevel.WARN,
        'USED LIMIT(DEAD) ? ' + Limits.getEmailInvocations()
      );
    }
  }
  public static void sendStripeReciept(
    decimal amount,
    string recieptUrl
  ) {
    List<OrgWideEmailAddress> orgEmail = [
      SELECT Id
      FROM OrgWideEmailAddress
      WHERE DisplayName = 'Org EMAIL'
      LIMIT 1
    ];
    string fromEmail = orgEmail[0].Id;
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    email.setSubject('Payment Successful');
    string userEmail = UserInfo.getUserEmail();
    string[] to = new List<string>{ 'ankurtrivediakku@gmail.com' };
    email.setToAddresses(to);
    email.setOrgWideEmailAddressId(fromEmail);
    email.setSaveAsActivity(false);
    email.setTargetObjectId(UserInfo.getUserId());
    String emailBody = '<html><body>';
    emailBody +=
      '<p>Payment of ' +
      amount +
      ' has been received. '+ 
      ' Please get your purchase reciept.</p>';
    emailBody +=
      '<a href="' +
      recieptUrl +
      '" style="display: inline-block; background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none;">View Receipt</a>';
    emailBody += '<p>Thank you for your payment!</p>';
    emailBody += '</body></html>';
    email.setHtmlBody(emailBody);
    try {
      System.debug(
        System.LoggingLevel.DEBUG,
        'USED LIMIT? ' + Limits.getEmailInvocations()
      );
      Messaging.SendEmailResult[] res = Messaging.sendEmail(
        new List<Messaging.SingleEmailMessage>{ email }
      );
      for (Messaging.SendEmailResult result : res) {
        if (!result.isSuccess()) {
          System.debug('Not DONE: ' + result.getErrors());
        } else {
          System.debug('SENT!');
          System.debug(result);
        }
      }
    } catch (Exception e) {
      System.debug(System.LoggingLevel.ERROR, e.getMessage());
      System.debug(
        System.LoggingLevel.WARN,
        'USED LIMIT(DEAD) ? ' + Limits.getEmailInvocations()
      );
    }
  }
}
