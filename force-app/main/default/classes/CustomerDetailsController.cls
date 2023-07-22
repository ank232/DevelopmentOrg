public with sharing class CustomerDetailsController {
    @AuraEnabled(cacheable=true)
    public static List<Invoice__c> ShowInvoices(string companyId){
        try {
            List<Invoice__c> invoices = [
                Select 
                Id,
                Name,
                Customer__r.FirstName,
                Customer__r.LastName,
                Due_Date__c,
                Invoice_Date__c,
                Status__c,
                Total_Line_Amount__c
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

    @AuraEnabled(Cacheable= true)
    public static Account  InvoicesTotal(String companyId){
        try {
            string query = 'SELECT Open_Invoices__c, Paid_Invoices__c, OverDue_Invoices__c FROM ACCOUNT WHERE ID =: companyId';
            Account getInvoices = Database.query(query);
            return getInvoices;         
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> productSearch(string ProductName){
        string searchTerm ='%'+ ProductName + '%';
        try {
            List<Product2> products = [
                SELECT 
                ID,
                Name
                FROM 
                PRODUCT2 
                WHERE 
                NAME 
                LIKE: searchTerm
            ];
            return products;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}