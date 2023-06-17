public with sharing class CustomerDetailsController {
    @AuraEnabled(cacheable=true)
    public static contact CustomerDetails(string CustomerId){
        try {
            Contact customerdetail = [SELECT NAME, Email, Phone FROM CONTACT WHERE ID =: customerId limit 1];
            return customerdetail;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    /*
    Method to return Related Contacts of an account
    @params: String-> CompanyId
    */ 
    @AuraEnabled(cacheable=true)
    public static List<Contact> RelatedContacts(string CompanyId, String searchterm)
    {
        string searchquery = '%'+ searchterm + '%';
        try {
        List<Contact> relatedCustomers = [SELECT Id, NAME FROM CONTACT WHERE ACCOUNTID =: CompanyId AND NAME 
        LIKE: searchquery];
        if(!relatedCustomers.isEmpty())
        {
            return relatedCustomers;
            } 
        else if(relatedCustomers.isEmpty()){
return relatedCustomers;
            }
            else{
                throw new AuraHandledException('No Customers Found');
            }
        }
            catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            } 
    }
}