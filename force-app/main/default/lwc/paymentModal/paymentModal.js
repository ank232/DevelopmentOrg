import LightningModal from "lightning/modal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createStripePayment from "@salesforce/apex/StripeService.createStripePayment";
import { api } from "lwc";
export default class PaymentModal extends LightningModal {
  paymentData;
  invoiceQuantity;
  @api recordId;
  @api message;
  priceId;
  stripePayURL;

  connectedCallback(){
    console.log('Payment Modal CC running');
    console.log(JSON.stringify(this.message));    
    console.log('VALS;');
    // console.log(this.recordId);
    // console.log(typeof this.message.invoicelines[0].Quantity);
    // console.log(typeof this.message.invoicelines[0].stipePrice);
    this.invoiceQuantity = this.message.invoicelines[0].Quantity;    
    this.priceId=this.message.invoicelines[0].stipePrice;
    console.log(this.priceId);
    console.log('Location: ',window.location.href);
    this.generateStripePayout(this.priceId, this.invoiceQuantity, window.location.href,this.recordId);
  }
  closePaymentModal = () => {
    console.log("Close event orrcured");
    // console.log(this.paymentData);
    // if (typeof this.paymentData !== "undefined") {
      const modalCloseEvent = new ShowToastEvent({
        title: "Success",
        message: "Payment Saved Successfully",
        variant: "Success"
      });
      this.dispatchEvent(modalCloseEvent);
      this.close({
        paymentData: this.paymentData
      });
    } 
generateStripePayout(stripe_product_id, productQuantity,redirect_url,invoiceId)
{
  createStripePayment({priceId: stripe_product_id, quanity: productQuantity, redirectUrl: redirect_url, invoiceId: invoiceId})
  .then(
(result)=>{
  const paymentlink = result;
  console.log(paymentlink);
  this.stripePayURL= paymentlink;
})
  .catch(
(error=>{
  console.log('Error Occured in generating payment link ',error);  
})
  );
}
  createPaymentRecord = (event) => {
    this.paymentData = event.detail.fields;
    console.log("Payment Data Saved!-> going to create--");
    // this.close(this.paymentData);
  };
  handleFlow = (event) => {
    console.log(event.detail);
    console.log("FLOW EVENT");
    console.log(event.detail.status);
  }
}