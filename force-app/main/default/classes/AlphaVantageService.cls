public with sharing class AlphaVantageService {
    private static final string API_KEY ='SKVYIMXNFOFODA4M';
    private static final string BASE_URL= 'https://www.alphavantage.co/query';
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