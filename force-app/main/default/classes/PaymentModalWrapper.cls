public class PaymentModalWrapper {
    @invocableVariable(label='invoiceid')
    public string invoiceId;
    @invocableVariable(label='redirect url')
    public string redirectUrl;
        public string invoiceStatus;
    @invocableVariable(label='dataitems')    
    public List<Data> data;
    public class Data
    {
        @invocableVariable(label='quantity')
        public integer Quantity;
        @invocableVariable(label='stripeprice')
        public string stripePrice;
    }
}