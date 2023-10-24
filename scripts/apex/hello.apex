// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

string tempvar = 'Enter_your_name_here';
System.debug('Hello World!');
System.debug('My name is ' + tempvar);

string symbol ='APPL';
HttpResponse res = AlphaVantageService.GetStockValue(symbol);
string jsonRes = res.getBody();
system.debug('ResponseCode===='+res.getStatusCode());
System.debug('Response got====='+jsonRes);
system.debug('res='+ AlphaVantageController.getQuote('MSFT'));
system.debug('dddd'+ d);

Object acs = AccountRestResource.getAccounts();
System.debug(acs);

string s = AccountRestResource.getAccounts();
system.debug(s);

List<Contact> deleteCons = [Select Id, firstname from contact where accountid = null];
system.debug('deleted'+ deleteCons.size());
delete deleteCons;

List<Account>deleteAccs = [Select Id, website from account where website like '%example.com'];
delete deleteAccs;

Contact c = CustomerDetailsController.CustomerDetails('0032w000011YQGFAA4');
system.debug('** I got this----'+ c.Phone);
Id recId = '0012w00001R41h4AAB';
string searchterm = 'prim';
string searstr = '%'+ searchterm + '%';
list<Contact> query=  new List<Contact>();
query = [select id, name from contact where AccountId =: recId and Name like: searstr];
System.debug('0-0-0-0-0-0-0-0-0-');
system.debug(query.size());
system.debug('-0-0-0-0-0-0-0-0-0-');
// Testing lwc controller

string rightterm = 'con';
string wrongterm = '&^';
string acId = '0012w00001R41h4AAB';
system.debug('-------------');
List<Contact> s   = CustomerDetailsController.RelatedContacts('', 'wrongterm');
system.debug(s);
System.debug('----------------------');
List<Contact> s = [select id, name, mailiingAddress from contact limit 1];
system.debug(s);

List<Invoice__c> invoices = [SELECT id, company__c, customer__c from Invoice__c where customer__c!= null];
for(integer i =0;i<invoices.size();i++){
System.debug('***********************'+invoices[i]);
}

string date1 = '2023-03-26';
system.debug(Date.valueOf(date1));

String dateString = '2023-06-22';
Date dateValue = Date.valueOf(dateString);
Datetime dateTimeValue = Datetime.newInstance(dateValue.year(), dateValue.month(), dateValue.day());
String formattedDate = dateTimeValue.format('dd/MM/yyyy');
System.debug(formattedDate); // Output: 22/06/2023
// Deleting all invoices: 
List<Invoice__c> invoice = [select id , company__c from Invoice__c];
delete invoice;
id acId = '0012w00001cWKxTAAW';
List<invoice__c> inv = [SELECT id, customer__c from invoice__c where company__c =: aciD];
System.debug('--------');
System.debug(inv);
system.debug('--------');

DumpClass.DoSomething();
CustomerDetailsController.InvoicesTotal('0012w00001OOKMhAAP');
DumpClass.UpdateMax();
map<string,object> res= AlphaVantageService.latestRates('USD', 'INR');

StripeService.createStripeProduct();