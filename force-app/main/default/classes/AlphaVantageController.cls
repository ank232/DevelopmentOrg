public with sharing class AlphaVantageController {
     private static final string API_KEY ='SKVYIMXNFOFODA4M';
     private static final string BASE_URL= 'https://www.alphavantage.co/query';
@auraEnabled(cacheable= true)
    public static Map<string, Object> FetchStock(string TickerSymbol)
    {  
        HttpRequest req = new HttpRequest();
        string ENDPOINT = BASE_URL+ '?function=GLOBAL_QUOTE&symbol='+TickerSymbol+'&apikey='+ API_KEY;
        req.setEndpoint(ENDPOINT);
        req.setMethod('GET');
        Map<string, object>JsonData  = new Map<String,Object>();
        string responseFromAPI = null;
        try 
        {
         Http http = new Http()   ;
         HttpResponse res  = http.send(req);
            system.debug('Response code'+ res.getStatusCode());
         if(res.getStatusCode() ==200)
         {
            responseFromAPI = res.getBody();
             system.debug('resonse=='+ responseFromAPI);
         }
         else
         {
            throw new CalloutException(res.getBody());
        }
        }catch(Exception ex) 
         {
            throw ex;
        }
        if(String.isNotBlank(responseFromAPI))
        {
            JsonData = (Map<String,Object>)json.deserializeUntyped(responseFromAPI);
            system.debug('Working---'+ jsonData);
        }
        if(!JsonData.isEmpty())
        {
            return JsonData;
        }
        else{
            return null;
        }
    }
}