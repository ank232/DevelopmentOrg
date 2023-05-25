/*
Wrapper ClASS TO PARSE ACOUNTS WITH ITS REALTED CONTACTS
*/
public with sharing class AccountContactsWrapper 
{
   public List<Accounts> Accounts;

   public class Contacts
   {
    	public String Contact_ExternalID;
		public String First_Name;
		public String Last_Name;
   }
   public class Accounts 
   {
		public String ExternalID;
		public String AccountName;
		public String emailAddress;
		public List<Contacts> Contacts;
	}
}