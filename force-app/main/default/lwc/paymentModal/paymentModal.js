import LightningModal from "lightning/modal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createStripePayment from "@salesforce/apex/StripeService.createStripePayment";
import { api } from "lwc";
export default class PaymentModal extends LightningModal {
  @api recordId;
  @api message;  
  stripePayURL;
  errorMessage;
  runOne = true;
  isDisabled= false;
  showpayBtn=false;
renderedCallback(){
if(this.runOne)
{
  console.log('RC running');
  console.log(this.message);
  this.runOne = false;
}
}
  connectedCallback(){
    let inputParam = {};
    inputParam.data = this.message.invoicelines;
    inputParam.redirectUrl =window.location.href;
    inputParam.invoiceId = this.recordId;
    this.showpayBtn = true;
    this.generateStripePayout(inputParam);
  }
  closePaymentModal = () => {
    console.log("Close event orrcured");   
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
generateStripePayout(invoiceLineItems)
{  
  let jsonData = JSON.stringify(invoiceLineItems);
  console.log("-=> ",jsonData);  
  createStripePayment({data:jsonData}).then((result)=>{    
    this.isDisabled = false;
    this.stripePayURL = result;
    this.errorMessage = undefined;
  }).catch((error)=>{
    this.stripePayURL = undefined;
    this.errorMessage = 'You cannot proceed further';    
    console.log('Err: ', error);
    let payButton = this.template.querySelector('.payBtn');
    payButton.setAttribute('disabled', true);
  });
}
}