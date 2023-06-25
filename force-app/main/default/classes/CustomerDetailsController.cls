public with sharing class CustomerDetailsController {
    @AuraEnabled(cacheable=true)
    public static List<Invoice__c> ShowInvoices(string companyId){
        try {
            List<Invoice__c>invoices = [
                Select 
                Id,
                Customer__r.FirstName,
                Customer__r.LastName,
                paid_date__c
                FROM
                invoice__c
                WHERE
                Company__c =: companyId
            ];
            return Invoices;
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
        List<Contact> relatedCustomers = [SELECT 
        Id, 
        NAME 
        FROM 
        CONTACT 
        WHERE 
        ACCOUNTID =: CompanyId 
        AND 
        NAME LIKE: searchquery];
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

    @AuraEnabled(cacheable=true)
    public static List<Contact> AllCustomers(string CompanyId)
    {
        try 
        {
            List<Contact> allContacts = [
                SELECT 
                NAME, 
                Phone,
                EMAIL,
                MailingStreet,
                MailingCity,
                MailingState,
                MailingCountry
                FROM 
                CONTACT 
                WHERE
                AccountId=: CompanyId
                 ];
                 if(!allContacts.isEmpty())
                 {
                    return allContacts;
                }
                else if(allContacts.isEmpty())
                {
                    return allContacts;
                }
                else
                {
                    throw new AuraHandledException('No contact Found');
                }
            } 
            catch(Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
    }