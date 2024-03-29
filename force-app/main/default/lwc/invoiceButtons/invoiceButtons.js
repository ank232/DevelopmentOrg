import { LightningElement, wire, api } from "lwc";
import { MessageContext, subscribe } from "lightning/messageService";
import { createRecord } from "lightning/uiRecordApi";
import InvoiceTotalMC from "@salesforce/messageChannel/InvoiceTotalMC__c";
import PaymentModal from "c/paymentModal";
import RefundModal from "c/refundModal";
// import PreviewInvoice from "c/previewInvoice";
import ExchangeRateModal from "c/exchangeRateModal";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
export default class InvoiceButtons extends LightningElement {
  @api recordId;
  trueVal;
  paymentRec;
  refundRec;
  totalLinePrice;
  paidAmount;
  @api invoicedata;
  runOnce = true;
  isDisabled = false;  
  renderedCallback() {
    if (this.runOnce) {
      console.log("I will disable the buttons(invoiceBtns)");            
      this.runOnce = false;
    }
  }
  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Payments__r",
    fields: [
      "Payment__c.Id",
      "Payment__c.Name",
      "Payment__c.Reference_Number__c",
      "Payment__c.Amount__c",
      "Payment__c.Status__c",
      "Payment__c.Comments__c",
      "Payment__c.Date__c"
    ]
  })
  PaymentRecords({ data, error }) {
    // const refButton = this.template.querySelector(".refundButton");
    if (data) {
      if (!data.count) {
        // refButton.classList.add('disabled-button');
        // refButton.setAttribute('disabled', true);
        // refButton.classList.add("slds-hide");        
      } else {
        // refButton.classList.remove('disabled-button');
        // let amnt = 0;
        // data.records.map((item) => {
        //     amnt += item.fields.Amount__c.value;
        // });        
      }
    }
    if (error) {
      console.log("getRelatedListRecords has some Problem(s)!");
    }
  }
  connectedCallback() {
    console.log("Connected Callback Ran(InvoiceButtons LWC)");
    this.LineItemReciever();
  }

  @wire(MessageContext) messageContext;

  showNoficiation(title, message, variant) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(showToast);
  }

  /* Recieving the LMS for LineItems */
  LineItemReciever() {
    subscribe(this.messageContext, InvoiceTotalMC, (message) => {
      this.InvoiceButtonVisibility(message);
    });
  }

  /* Defining the Payment Button Visibility 
    Condition: if Invoice is Approved and has LineItems ?
     */
  InvoiceButtonVisibility = (data) => {
    const button = this.template.querySelector(".paymentButton");
    if (data.invoicelines.length === 0) {
      button.classList.add("slds-hide");
      // button.classList.add("slds-hidden");
      // button.setAttribute = true;
      button.setAttribute('disabled',true);
      button.classList.add('disabled-button');
    } else {
      button.removeAttribute('disabled');
      const fireOrigin = data.fireOrigin;
      if (fireOrigin.includes("Related")) {
        this.invoicedata = data;
        console.log(this.invoicedata);
        const maxAmnt = data.invoicelines.reduce(
          (total, lineitem) => total + lineitem.totalAmount,
          0.0
        );
        const totalTax = data.invoicelines.reduce(
          (taxtotal, lineitem) => taxtotal + lineitem.taxAmount,
          0.0
        );
        this.totalLinePrice = maxAmnt + totalTax;
      }
    }
  };

  ProcessPayment = (paymentData) => {  
    this.createpaymentRecord(paymentData);
  };

  createpaymentRecord(paymentrec) {
    paymentrec.Invoice__c = this.recordId;
    paymentrec.Name = "";
    const recordInput = {
      apiName: "Payment__c",
      fields: paymentrec
    };
    createRecord(recordInput)
      .then((result) => {
        console.log(result);
        window.location.reload();
      })
      .catch((error) => {
        this.showNoficiation(
          "Error",
          error.body.output.errors[0].message,
          "Error"
        );
        console.log(error);
      });
  }
check(stripeId){
if(!stripeId)
{
  return false;
}
return true;
}
/* Modal to make payment through stripe system, it should only open only when we have invoicelines and stripeProductIds attached to it*/ 
  async RecordPayment() {
    await PaymentModal.open({
      size: "Small",
      message: this.invoicedata,
      recordId: this.recordId
    })
      .then((result) => {
        if (result.paymentData) {
          this.paymentRec = result.paymentData;
          // this.ProcessPayment(this.paymentRec);
        }
      })
      .catch((error) => {
        console.log("Error in Modal!!");
        console.log(error);
      });
  }

  async RecordRefund() {
    await RefundModal.open({
      size: "Small"
    })
      .then((result) => {
        console.log("Recieved refund!");
        if (result.refundData) {
          this.refundRec = result.refundData;
          this.ProcessRefund(this.refundRec);
        }
      })
      .catch((error) => {
        console.log("Error in RefundModal");
        console.log(error);
      });
  }

  ProcessRefund(refundData) {
    console.log("I will create the refund!");
    console.log(refundData);
    console.log(refundData);
    // if (refundData.Amount__c > this.paidAmount) {
    //     this.showNoficiation("Warning", "Refunded amount should not exceed the paid Amount");
    //     return;
    // } else {
    console.log(refundData);
    // if (refundData.Amount__c > this.paidAmount) {
    //     this.showNoficiation("Warning", "Refunded amount should not exceed the paid Amount");
    //     return;
    // } else {
    this.createRefundRecord(refundData);
  }

  createRefundRecord(refundrec) {
    refundrec.Invoice__c = this.recordId;
    const recordInput = {
      apiName: "Refund__c",
      fields: refundrec
    };
    createRecord(recordInput)
      .then((result) => {
        this.showNoficiation(
          "Success",
          "Refund recorded Successfully",
          "Success"
        );
        console.log("*** ", result);
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        this.showNoficiation(
          "Error",
          error.body.output.errors[0].message,
          "Error"
        );
      });
  }

  async fetchExchangeRates() {
    await ExchangeRateModal.open({
      size: "small"
    })
      .then((result) => {
        if (result.data) {
          console.log("Result arrived");
          console.log(JSON.stringify(result));
          this.showNoficiation(
            "Message",
            "Current Exchange Rates are",
            "Message"
          );
        }
      })
      .catch((error) => {
        this.showNoficiation("Message", "Problem in Modal!", "Message");
        console.error(error);
      });
  } 
}
