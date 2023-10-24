@RestResource( urlMapping='/stripe/webhook/v1/*')
global without sharing class StripeWebHook {        
    @HttpPost 
    global static void doPost(){
        RestResponse response = RestContext.response;
        response.addHeader('Content-Type','application/json');
        String responseString =RestContext.request.requestBody.toString();
        System.debug('-----------------------------------------------');
        System.debug(System.LoggingLevel.DEBUG,'****=> \n'+ responseString);
        response.responseBody = Blob.valueOf('{success: true, event: "Unknown"}');
        // response.statusCode = 200;
        Map<String,String>  headers =RestContext.request.headers;        
    }
    private void validateStripeSign(RestRequest request, String responseString){

        //
    }
    @httpGet
    global static String doGet(){
     return '{"messsage": "Test Webhook for Stripe}';
    }
}