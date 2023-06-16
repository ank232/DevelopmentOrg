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
}