public class StripeCheckoutwrapper {
  public integer amount_subtotal;
  public integer amount_total;
  public customer_details customer_details;
  public string payment_intent;
  public metadata metadata;
  public class metadata {
    public string invoiceId;
  }
  public class customer_details {
    public string email;
    public string name;
    public string phone;
    public address address;
  }
  public class address {
    public string city;
    public string country;
    public string postal_code;
    public string state;
  }
}
