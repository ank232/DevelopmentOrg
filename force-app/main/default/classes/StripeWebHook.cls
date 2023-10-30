@RestResource(urlMapping='/stripe/webhook/v1/*')
global without sharing class StripeWebHook {
  private static final string SIGNATURE_VALID = 'Signature Verified';
  private static final string SIGNATURE_INVALID = 'Signature Invalid';
  @HttpPost
  global static void doPost() {
    RestResponse response = RestContext.response;
    // sendEmail(78, 'reciept');
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
      String eventType = String.valueOf(stripePaymentData.get('type'));
      if (eventType == 'charge.succeeded') {
        Map<String, Object> data = (Map<String, Object>) stripePaymentData.get(
          'data'
        );
        System.debug(System.LoggingLevel.DEBUG, '****=> \n' + responseString);
        StripePaymentWrapper paymentData = (StripePaymentWrapper) JSON.deserialize(
          JSON.serialize(data.get('object')),
          StripePaymentWrapper.class
        );
        Integer amount = paymentData.amount;
        String reciept = paymentData.receipt_url;
      }
      response.responseBody = Blob.valueOf('{success: true, event: "Unknown"}');
      response.statusCode = 200;
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
}
