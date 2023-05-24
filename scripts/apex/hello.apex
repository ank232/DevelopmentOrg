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