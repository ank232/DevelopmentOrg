public with sharing class AlphaVantageService {
    private static  string API_KEY;
    private static final string BASE_URL= 'https://www.alphavantage.co/query';
    public  AlphaVantageService()
    {
        AlphaVantage_API__mdt[] apiKey =[SELECT MasterLabel,api_key__c FROM AlphaVantage_API__mdt];
        API_KEY = apiKey[0].Api_key__c;
    }
    
    public static Map<String,Object> latestRates(string fromCurency, string toCurrency)
    {
        HttpRequest req = new HttpRequest();
        Map<String,Object> apiRes = new Map<String,Object>();
        string endpoint = BASE_URL + '?function=CURRENCY_EXCHANGE_RATE&from_currency='+fromCurency+'&to_currency='+toCurrency+'&apikey='+ API_KEY;
        req.setEndpoint(endpoint);
        String responseFromAPI = null;
        req.setMethod('GET');

        try {
            Http http = new Http();
            HttpResponse res = http.send(req);
            if(res.getStatusCode() == 200)
            {
                responseFromAPI =res.getBody();
            }
        } catch(CalloutException calloutex) {
            throw new CalloutException();
        } 

        if(String.isBlank(responseFromAPI))
        {
            apiRes = (Map<String, Object>) JSON.deserializeUntyped(responseFromAPI);
        }

        return apiRes;         
    }
    @AuraEnabled(cacheable= true)
    public static decimal GetQuote(string symbol)
    {
        HttpRequest req = new HttpRequest();
        string endpoint = BASE_URL+ '?function=GLOBAL_QUOTE&symbol='+symbol+'&apikey='+ API_KEY;
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        
        Http http = new Http();
        httpresponse res = http.send(req);
        string fetchedData = res.getBody();
        
        system.debug(fetchedData);
        
        if(res.getStatusCode()==200)
        {
            Map<String, Object> quoteData = (Map<String, Object>)JSON.deserializeUntyped(fetchedData);
            Map<string, object>quoteValue = (map<string, object>)quoteData.get('Global Quote');
            system.debug('Value='+ quoteValue.get('05. price'));
            decimal finalPrice = decimal.valueOf((string)quoteValue.get('05. price'));
            return finalPrice;
        }
        return 0;
    }
}