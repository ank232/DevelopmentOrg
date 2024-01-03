public class PaymentModalWrapper {
    public string invoiceId;
    public string redirectUrl;
    public string invoiceStatus;
public List<Data> data;
    public class Data
    {
        public integer Quantity;
        public string stripePrice;
    }
}