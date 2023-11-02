public class StripePaymentWrapper {
  public string id;
  public integer amount;
  public integer amount_captured;
  public string balance_transaction;  
  public billing_details billing_details;
  public boolean captured;
  public string paid;  
  public string receipt_url;  
  public class billing_details {
    public address address;
    public string email;
    public string name;
    public integer phone;
  }
    public class address {
      public string city;
      public string country;
      public string postal_code;
      public string state;
    }
  }
