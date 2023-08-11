import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { createRecord } from 'lightning/uiRecordApi';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import PaymentModal from 'c/paymentModal';
import RefundModal from 'c/refundModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    trueVal;
    paymentRec;
    totalLinePrice;

    connectedCallback() {
        console.log('Connected Callback Ran(InvoiceButtons LWC)');
        this.LineItemReciever();
    }

    @wire(MessageContext)
    messageContext;

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
        if (data.invoicelines.length == 0) {
            console.log('data has no lineItems');
            button.classList.add('slds-hide');
        } else {
            const fireOrigin = data.fireOrigin;
            if (fireOrigin.includes("Related")) {
                const maxAmnt = data.invoicelines.reduce((total, lineitem) => total + lineitem.totalAmount, 0.0);
                const totalTax = data.invoicelines.reduce((taxtotal, lineitem) => taxtotal + lineitem.taxAmount, 0.0);
                this.totalLinePrice = maxAmnt + totalTax;
            }
        }
    }

    ProcessPayment = (paymentData) => {
        const AmounttoPaid = paymentData["Amount__c"];
        if (AmounttoPaid > this.totalLinePrice) {
            this.showNoficiation("Warning", "Payment must be greater than the total LineItem", "Message");
            return;
        }
        this.createpaymentRecord(paymentData);
    }

    createpaymentRecord(paymentrec) {
        paymentrec.Invoice__c = this.recordId;
        paymentrec.Name = "";
        console.log('I will create the payment!');
        const recordInput = {
            apiName: 'Payment__c',
            fields: paymentrec
        };
        console.log('&&&&');
        console.log(JSON.stringify(recordInput));
        createRecord(recordInput).then((result) => {
            console.log('Payment rec created!!');
            console.log(result);
            window.location.reload();
        }).catch((error) => {
            this.showNoficiation("Error", error.errorType, "Error");
            console.log(error);
        });
    }

    async RecordPayment() {
        this.trueVal = true;
        await PaymentModal.open({
            size: 'Small'
        }).then((result) => {
            if (result.paymentData) {
                this.paymentRec = result.paymentData;
                console.log(this.paymentRec);
            }
        }).catch((error) => {
            console.log('Error in Modal!!');
            console.log(error);
        });
        if (!this.paymentRec) {
            console.log('Undefined or not Created!!');
            return;
        } else {
            console.log('Payment Rec Recieved!');
            this.ProcessPayment(this.paymentRec);
        }
    }

    async RecordRefund() {
        await RefundModal.open({
            size: 'small'
        }).then((result) => {
            console.log('Recieved refund!');
            console.log(result);
        }).catch((error) => {
            console.log("Error in RefundModal")
            console.log(error);
        });
    }
}