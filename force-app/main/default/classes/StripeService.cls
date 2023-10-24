global without sharing class StripeService {
   private static final string API_key = 'sk_test_51O1Y31SHDmZoIlazRyaoVZGhVZE9aVUDCfFCdq3m3mUwksQstO25Fz2QUDtwNIhQehmGeIdeaxyZm53uQu58hamI00pK8ev0pu';
   private static final string StripeEndpoint = 'https://api.stripe.com/v1';
   private static string ProductId = 'prod_OsBxPCe5UFZ8vD';
   private static string priceId;
   
public static void createStripeCustomer()
{    
    Map<String, Object> requestBody = new Map<String, Object>();
    requestBody.put('name', 'Gabriel');
    requestBody.put('email','ankurtrivediakku@gmail.com');
    String requestJSON = JSON.serialize(requestBody);

    HttpRequest req  = new HttpRequest();
    req.setEndpoint(StripeEndpoint + '/customers');
    req.setMethod('POST');
    req.setHeader('Authorization', 'Bearer '+ API_key);
    req.setHeader('Content-Type','application/x-www-form-urlencoded');
    req.setBody(requestJSON);

    Http http = new Http();
    HttpResponse response = http.send(req);
    if(response.getStatusCode()==200 || response.getStatusCode()== 201)
    {
        System.debug('USER CREATED IN STRIPE');
        System.debug(response.getBody());
    }
    else{
        System.debug('FAILED>????');
        System.debug(response.getStatusCode());
        System.debug(response.getBody());
    }
}
public static void createStripeProduct(){
   Map<String, String> requestBody = new Map<String, String>();
   requestBody.put('name','DRONE V2.0');   
   map<String, object> priceData = new Map<String, Object>();
   priceData.put('currency','inr');
   priceData.put('unit_price', 3454);
   string jsonPrice = JSON.serialize(priceData);
   String priceEncode =EncodingUtil.urlEncode(jsonPrice, 'UTF-8');
   System.debug(priceEncode);
   string urlEncodebody = 'name='+ EncodingUtil.urlEncode(requestBody.get('name'), 'UTF-8');
   urlEncodebody += '&default_price_data[currency]='+EncodingUtil.urlEncode(String.valueOf(priceData.get('currency')), 'UTF-8') ;
   urlEncodebody+= '&default_price_data[unit_amount]='+ EncodingUtil.urlEncode(String.valueOf(priceData.get('unit_price')),'UTF-8');
   HttpRequest req = new HttpRequest();
   req.setEndpoint(StripeEndpoint + '/products');
   req.setMethod('POST');   
   req.setHeader('Authorization', 'Bearer '+ API_key);
   req.setHeader('Content-Type','application/x-www-form-urlencoded');
   req.setBody(urlEncodebody);

 Http http = new Http();
    HttpResponse response = http.send(req);

    if(response.getStatusCode()==200 || response.getStatusCode()== 201)
    {
        System.debug('Product Created IN Stripe');
        System.debug(response.getBody());
    }
    else{
        System.debug('FAILED>????');
        System.debug(response.getStatusCode());
        System.debug(response.getBody());
    }
}
public static void getListProducts()
{
    Map<String, Object> res = new Map<String, Object>();
    string stripeProductId = 'prod_OsBxPCe5UFZ8vD';
    String responseAPI;
    HttpRequest stripeReq = new HttpRequest();
    stripeReq.setMethod('GET');
    stripeReq.setEndpoint(StripeEndpoint + '/products/' +stripeProductId);
    stripeReq.setHeader('Authorization', 'Bearer '+ API_key);
    stripeReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    try {
    Http http = new Http();
    HttpResponse stripeResponse =http.send(stripeReq);
    if(stripeResponse.getStatusCode() ==200)
    {
        responseAPI= stripeResponse.getBody();
        string Response =  EncodingUtil.urlDecode(stripeResponse.getBody(), 'UTF-8');
        res = (Map<String, Object>)JSON.deserializeUntyped(responseAPI);
        System.debug(res.get('name'));
        priceId = String.valueOf(res.get('default_price'));
        createStripePayment();
    }
    if(stripeResponse.getStatusCode()== 404)
    {
        System.debug('Not FOUND');
    }
} 
  catch(CalloutException e) {
    System.debug(e.getMessage());
}
}
public static void createStripePayment()
{
    Map<String, Object> requestbody = new Map<String, Object>();
    requestbody.put('lineItemPrice',priceId);
    requestbody.put('lineItemQuantity', 2);
    string encodedResponse = 'line_items[0[price]]='+EncodingUtil.urlEncode(String.valueOf(requestbody.get('lineItemPrice')), 'UTF-8');
    encodedResponse+= '&line_items[0][quantity]='+ EncodingUtil.urlEncode(String.valueOf(requestbody.get('lineItemQuantity')), 'UTF-8');
    HttpRequest stripePayreq = new HttpRequest();    
    stripePayreq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    stripePayreq.setHeader('Authorization', 'Bearer '+ API_key);
    stripePayreq.setEndpoint(StripeEndpoint + '/payment_links');
    stripePayreq.setMethod('POST');
    stripePayreq.setBody(encodedResponse);

    Http http = new Http();
    HttpResponse response = http.send(stripePayreq);
    // system.debug(response.getBody());
    if(response.getStatusCode()== 200)
    {
        Map<String, Object> responsebody = (Map<String, Object>) (JSON.deserializeUntyped(response.getBody()));
        string link = String.valueOf(responsebody.get('url'));
        System.debug(link);
    }
     else{
        System.debug('FAILED>????');
        System.debug(response.getStatusCode());
        System.debug(response.getBody());
    }
}   
public static void createProductsinStripe()
{
    List<Product2> products = [Select name, Description, currencyIsoCode from Product2 Limit 2];
    Map<String, String> prodMap = new Map<String, String>();
    string payload;
    for(Product2 prod: products)
    {
         payload = 'name=' +EncodingUtil.urlEncode(prod.Name, 'UTF-8');        
        payload+= '&default_price_data[currency]='+ prod.currencyIsoCode.toLowerCase();
        payload+= '&default_price_data[unit_amount]=' + EncodingUtil.urlEncode(String.valueOf('5600'), 'UTF-8') + '&';
    }
    String testbody = payload;
        HttpRequest req = new HttpRequest();
        req.setEndpoint(StripeEndpoint + '/products');
        req.setMethod('POST');   
        req.setHeader('Authorization', 'Bearer '+ API_key);
        req.setHeader('Content-Type','application/x-www-form-urlencoded');
        req.setBody(testbody);
        
        Http http = new Http();
        HttpResponse response = http.send(req);
        
        if(response.getStatusCode()==200 || response.getStatusCode()== 201)
        {
            System.debug('Product Created IN Stripe');
            System.debug(response.getBody());
        }
    else{
        System.debug('FAILED>????');
        System.debug(response.getStatusCode());
        System.debug(response.getBody());
    }
}
}