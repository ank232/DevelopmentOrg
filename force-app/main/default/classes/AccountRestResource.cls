@RestResource(UrlMapping= '/GetPremiumAccs')

global with sharing class AccountRestResource 
{ 
/* 
    Helper Methods.....
    */
  private static String CreateJsonResponse(List<Account> onlyAccs){
   string AccountsJson;
   JSONGenerator generator = JSON.createGenerator(true);
   // Write Ojbect 
   // field name 
   // array 
   generator.writeStartObject();
   generator.writeFieldName('Accounts');
   generator.writeStartArray();
   for(Account acc: onlyAccs)
   {
    generator.writeStartObject();
    generator.writeStringField('First-Name', acc.Name);
   if(acc.Industry!= null){
    generator.writeStringField('Industry', acc.Industry);
   }
   else{
    generator.writeNullField('Industry');
   }
    
    generator.writeEndObject();
   }
   generator.writeEndArray();
   generator.writeEndObject();
   AccountsJson  = generator.getAsString();
   return AccountsJson;
  } 
    private static Integer ParseJSON(Blob requestBody)
    {
           String JsonResfromPostman  = requestBody.toString();
         RestAccountWrapper RestAccs  = (RestAccountWrapper)Json.deserialize(JsonResfromPostman, RestAccountWrapper.class);
          //system.debug('From PostMan'+ RestAccs);
          List<RestAccountWrapper.AccountDetails> accDetails = RestAccs.Accounts;
          system.debug('Response==='+ accDetails);
          List<Account> ResAccsToAdd = new List<Account>();
          for (RestAccountWrapper.AccountDetails Eachaccount : accDetails) {
            ResAccsToAdd.add(
             new Account(Name=Eachaccount.First_Name,Industry= Eachaccount.Industry, 
             Account_External_ID__c = Eachaccount.ExternalID,
                Description ='Added by Rest Service'));
          }
          InsertRestAccounts.insertAccs(ResAccsToAdd);
          return ResAccsToAdd.size();
  } 
  private static integer UpdateAccounts(Blob RequestBody)
  {
    String BlobtoJson = RequestBody.toString();
    RestAccountWrapper RestAccs = (RestAccountWrapper)JSON.deserialize(BlobtoJson,RestAccountWrapper.class );
    List<RestAccountWrapper.AccountDetails> accDetails = RestAccs.Accounts;
          system.debug('Response==='+ accDetails);
          List<Account> ResAccsToAdd = new List<Account>();
          for (RestAccountWrapper.AccountDetails Eachaccount : accDetails) {
            ResAccsToAdd.add(
             new Account(Name=Eachaccount.First_Name,Industry= Eachaccount.Industry, 
             Account_External_ID__c = Eachaccount.ExternalID,
                Description ='Updated by Rest Service'));
          }
          InsertRestAccounts.UpdateAccs(ResAccsToAdd);
          return ResAccsToAdd.size();
  }
                 /*============= Rest Resources   ==================*/ 
   @HttpPut
   global static string UpdateAccountsFromPostMan()
   {
    RestRequest req = RestContext.request;
    RestResponse res = Restcontext.response;
    Integer TotalAccsUpdated = UpdateAccounts(req.requestBody);
    return 'Total'+ TotalAccsUpdated +'Updated';
   }

   @HttpPost
   global static  string  CreateAccountFromPostman()
   {
    RestRequest req = RestContext.request;
    RestResponse res = Restcontext.response;
   Integer TotalAcssAdded = ParseJSON(req.requestBody);
   return TotalAcssAdded + 'Accounts Created';
    //Map<String, object> responseFromPostman =  req.requestBody;
   // system.debug('Response from Postman=='+ responseFromPostman);
    }

 @httpGet
 global static string getAccounts()
 {
    RestRequest req = RestContext.request;
    RestResponse res = RestContext.response;
    List<Account> PremAccs = PremiumAccounts.getPremiumAccounts();
    List<Account> onlyAccs = PremiumAccounts.PostAccounts();
    string JsonRes  = CreateJsonResponse(onlyAccs);
    system.debug('Json =='+ JsonRes);
    return jsonRes;
     /*
     Map<ID,list<Contact>> accountconMap = new  Map<id, list<Contact>>();

      for(Account ac: PremAccs)
      {
            accountconMap.put(ac.Id, ac.contacts);
        }
        String JsonResponse;
        JSONGenerator gen = JSON.createGenerator(true);

        gen.writeStartObject();
        gen.writeFieldName('Accounts');
        gen.writeStartArray();
        for(Id accountId : accountconMap.keySet())
        {
            gen.writeStartObject();

             gen.writeStringField('AccountId', accountId);

        gen.writeFieldName('contacts');
        gen.writeStartArray();

        List<Contact>contacts  =  accountconMap.get(accountId);
        
        for(contact con: contacts)
        {
            gen.writeStartObject();

             gen.writeStringField('ContactID', con.Id);
             gen.writeStringField('First-Name', con.FirstName);
             gen.writeStringField('Last-Name',con.LastName);

    gen.writeEndObject();
   }
   gen.writeEndArray();
   gen.writeEndObject();
}

gen.writeEndArray();
gen.writeEndObject();

JsonResponse = gen.getAsString();
 // return JsonResponse;
 */
    }
 }