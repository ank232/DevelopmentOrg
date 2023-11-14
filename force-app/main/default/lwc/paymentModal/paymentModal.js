import LightningModal from "lightning/modal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createStripePayment from "@salesforce/apex/StripeService.createStripePayment";
import { api } from "lwc";
export default class PaymentModal extends LightningModal {
  @api recordId;
  @api message;  
  stripePayURL;
  runOne = true;
  isDisabled= false;
renderedCallback(){
if(this.runOne)
{
  let btn = this.template.querySelector(".payBtn");
  if(this.message.invoicelines &&this.message.invoiceStatus!== 'Approved')
  {
    console.log('RC running');
    console.log('Not Approved??(RC)');
    console.log(btn);
    btn.setAttribute('disabled',true);
    btn.classList.add('disabled-button');
    btn.setAttribute =true;  
  }
  else{  
    console.log('Approved ??(RC)');
    btn.removeAttribute('disabled');
    btn.classList.remove('disabled-button');
    console.log(btn);
  }
  // btn.disabled = true;
  this.runOne = false;
}
}
  connectedCallback(){               
    let inputParam = {};
    inputParam.data = this.message.invoicelines;
    inputParam.redirectUrl =window.location.href;
    inputParam.invoiceId = this.recordId; 
    const isApproved =this.checkEligibility(this.message.invoiceStatus);   
    if(!isApproved)
    {     
      return;
    }
    this.generateStripePayout(inputParam);
  }
  checkEligibility(invoiceStatus)
  {
    if(invoiceStatus!=='Approved')
    {
      return false;
    }
    return true;
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
generateStripePayout(invoiceLineItems)
{  
  let jsonData = JSON.stringify(invoiceLineItems);
  console.log("-=> ",jsonData);  
  createStripePayment({data:jsonData}).then((result)=>{
    console.log('Res ',result);
    this.stripePayURL = result;
  }).catch((error)=>{
    console.log('Err: ', error);
  });
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
    showNoficiation(title, message, variant,sticky) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
      mode: sticky
    });
    this.dispatchEvent(showToast);
  }
}