public with sharing class FlowInputParams {
    @AuraEnabled
    public id invoiceid;
    @AuraEnabled
    public string status;
    @AuraEnabled
    public string pName;
    @AuraEnabled
    public List<StripeData> stripeitems;
    public class StripeData{
    @AuraEnabled 
    public string stripeId;
    @AuraEnabled
    public integer quantity;
}
}
