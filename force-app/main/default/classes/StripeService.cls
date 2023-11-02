global without sharing class StripeService {
  private static string API_KEY;
  private static final string StripeEndpoint = 'https://api.stripe.com/v1';

  public static void createStripeCustomer() {
    Map<String, String> requestBody = new Map<String, String>();
    requestBody.put('name', 'Gabriel V2.0');
    requestBody.put('email', 'ankurtrivediakku@gmail.com');
    // String requestJSON = JSON.serialize(requestBody);
    string payload =
      'name=' + EncodingUtil.urlEncode(requestBody.get('name'), 'UTF-8');
    payload +=
      '&email=' + EncodingUtil.urlEncode(requestBody.get('email'), 'UTF-8');

    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:Stripe_System/customers');
    req.setMethod('POST');
    // req.setHeader('Authorization', 'Bearer '+ API_key);
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setBody(payload);

    Http http = new Http();
    HttpResponse response = http.send(req);
    if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
      System.debug('USER CREATED IN STRIPE');
      System.debug(response.getBody());
    } else {
      System.debug('FAILED>????');
      System.debug(response.getStatusCode());
      System.debug(response.getBody());
    }
  }
  public static void createStripeProduct() {
    Map<String, String> requestBody = new Map<String, String>();
    requestBody.put('name', 'DRONE V2.0');
    map<String, object> priceData = new Map<String, Object>();
    priceData.put('currency', 'inr');
    priceData.put('unit_price', 3454);
    string jsonPrice = JSON.serialize(priceData);
    String priceEncode = EncodingUtil.urlEncode(jsonPrice, 'UTF-8');
    System.debug(priceEncode);
    string urlEncodebody =
      'name=' + EncodingUtil.urlEncode(requestBody.get('name'), 'UTF-8');
    urlEncodebody +=
      '&default_price_data[currency]=' +
      EncodingUtil.urlEncode(
        String.valueOf(priceData.get('currency')),
        'UTF-8'
      );
    urlEncodebody +=
      '&default_price_data[unit_amount]=' +
      EncodingUtil.urlEncode(
        String.valueOf(priceData.get('unit_price')),
        'UTF-8'
      );
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:Stripe_System/products');
    req.setMethod('POST');    
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setBody(urlEncodebody);

    Http http = new Http();
    HttpResponse response = http.send(req);

    if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
      System.debug('Product Created IN Stripe');
      System.debug(response.getBody());
    } else {
      System.debug('FAILED>????');
      System.debug(response.getStatusCode());
      System.debug(response.getBody());
    }
  }
  public static void getListProducts() {
    Map<String, Object> res = new Map<String, Object>();
    String responseAPI;
    HttpRequest stripeReq = new HttpRequest();
    stripeReq.setMethod('GET');
    stripeReq.setEndpoint('callout:Stripe_System/products?active=true');
    stripeReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    try {
      Http http = new Http();
      HttpResponse stripeResponse = http.send(stripeReq);
      if (stripeResponse.getStatusCode() == 200) {
        System.debug('Found Acive Products');
        System.debug(stripeResponse.getBody());
        // parseData(stripeResponse.getBody());
      }
      if (stripeResponse.getStatusCode() == 404) {
        System.debug('Not FOUND');
      }
    } catch (CalloutException e) {
      System.debug(e.getMessage());
    }
  }
  private static void parseData(string jsonData) {
    StripeWrapper stripeProductdata = (StripeWrapper) JSON.deserialize(
      jsonData,
      StripeWrapper.class
    );
    System.debug(stripeProductdata);
    List<StripeWrapper.ProductData> productList = stripeProductdata.data;
    List<Product2> products = new List<Product2>();
    for (StripeWrapper.ProductData product : productList) {
      products.add(
        new Product2(
          name = product.name,
          Description = 'Added form Stripe',
          Stripe_Product_Id__c = product.id,
          currencyIsoCode = 'USD',
          IsActive = true,
          Stripe_Price_Id__c = product.default_price
        )
      );
    }
    System.debug('Products Ready to insert IN DB');
    Database.UpsertResult[] result = Database.upsert(
      products,
      Product2.Stripe_Product_Id__c,
      false
    );
    for (Database.UpsertResult res : result) {
      if (res.isSuccess()) {
        if (res.isCreated()) {
          System.debug('Product Created-> ' + res.getId());
        } else {
          System.debug('Products Updated: ' + res.getId());
        }
      }
      if (!res.success) {
        for (Database.Error err : res.getErrors()) {
          System.debug('Error In creating or Upd products');
          System.debug(err.getMessage());
        }
      }
    }
  }
  @auraEnabled
  public static string createStripePayment(string priceId, integer quanity,string redirectUrl) {
    Map<String, Object> requestbody = new Map<String, Object>();
    // System.debug('VALUES:::');
    // System.debug(priceId + '||| ' + quanity);
    requestbody.put('lineItemPrice', priceId);
    requestbody.put('lineItemQuantity', quanity);
    requestbody.put('redirectUrl', redirectUrl);
    string encodedResponse =
      'line_items[0[price]]=' +
      EncodingUtil.urlEncode(
        String.valueOf(requestbody.get('lineItemPrice')),
        'UTF-8'
      );
    encodedResponse +=
      '&line_items[0][quantity]=' +
      EncodingUtil.urlEncode(
        String.valueOf(requestbody.get('lineItemQuantity')),
        'UTF-8'
      );
      encodedResponse +='&after_completion[type]=redirect' + '&after_completion[redirect][url]='+ EncodingUtil.urlEncode(String.valueOf(requestbody.get('redirectUrl')), 'UTF-8');
    HttpRequest stripePayreq = new HttpRequest();
    stripePayreq.setEndpoint('callout:Stripe_System/payment_links');
    stripePayreq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    stripePayreq.setMethod('POST');
    stripePayreq.setBody(encodedResponse);
    Http http = new Http();
    HttpResponse response = http.send(stripePayreq);
    if (response.getStatusCode() == 200) {
      Map<String, Object> responsebody = (Map<String, Object>) (JSON.deserializeUntyped(
        response.getBody()
      ));
      string link = String.valueOf(responsebody.get('url'));
      System.debug(link);
      return link;
    }
    if (response.getStatusCode() == 400) {
      string error = 'Bad Request, Try again';
      return error;
    } else {
      System.debug('FAILED>????');
      System.debug(response.getStatusCode());
      System.debug(response.getBody());
      return null;
    }
  }
  public static void createProductsinStripe() {
    List<Product2> products = [
      SELECT name, Description, currencyIsoCode
      FROM Product2
      LIMIT 2
    ];
    Map<String, String> prodMap = new Map<String, String>();
    string payload;
    for (Product2 prod : products) {
      payload = 'name=' + EncodingUtil.urlEncode(prod.Name, 'UTF-8');
      payload +=
        '&default_price_data[currency]=' + prod.currencyIsoCode.toLowerCase();
      payload +=
        '&default_price_data[unit_amount]=' +
        EncodingUtil.urlEncode(String.valueOf('5600'), 'UTF-8') +
        '&';
    }
    String testbody = payload;
    HttpRequest req = new HttpRequest();
    req.setEndpoint(StripeEndpoint + '/products');
    req.setMethod('POST');
    req.setHeader('Authorization', 'Bearer ' + API_key);
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setBody(testbody);

    Http http = new Http();
    HttpResponse response = http.send(req);

    if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
      System.debug('Product Created IN Stripe');
      System.debug(response.getBody());
    } else {
      System.debug('FAILED>????');
      System.debug(response.getStatusCode());
      System.debug(response.getBody());
    }
  }  
}
