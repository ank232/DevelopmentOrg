import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import Status_field from '@salesforce/schema/Invoice__c.Status__c';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import PaymentModal from 'c/paymentModal';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    trueVal;
    paymentRec;
    totalLinePrice;

    connectedCallback() {
        this.LineItemReciever();
    }

    @wire(MessageContext)
    messageContext;

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
                console.log('Items from wired !');
                console.log('Calculating the Total Amount');
                console.log('Also the invoiceId-->');
                console.log(this.recordId);
                const maxAmnt = data.invoicelines.reduce((total, lineitem) => total + lineitem.totalAmount, 0.0);
                const totalTax = data.invoicelines.reduce((taxtotal, lineitem) => taxtotal + lineitem.taxAmount, 0.0);
                this.totalLinePrice = maxAmnt + totalTax;
            }
        }
    }

    ProcessPayment = (paymentData) => {
        const AmounttoPaid = paymentData["Amount__c"];
        console.log('You enter this amount-->', AmounttoPaid);
        this.createpaymentRecord(paymentData);
    }
    createpaymentRecord(paymentrec) {
        paymentrec.Invoice__c = this.recordId;
        console.log('I will create the payment!');
        const recordInput = {
            apiName: 'Payment__c ',
            fields: paymentrec
        };
        createRecord(recordInput).then((result) => {
            console.log('Payment rec created!!');
            console.log(result);
        }).catch((error) => {
            console.log('No Done!');
            console.log(error);
        });
    }
    async RecordPayment() {
        this.trueVal = true;
        await PaymentModal.open({
            size: 'Small'
        }).then((result) => {
            // console.log(result);
            if (result.paymentData) {
                this.paymentRec = result.paymentData;
                console.log(this.paymentRec);
            }
        });
        if (!this.paymentRec) {
            console.log('Undefined or not Created!!');
            return;
        } else {
            console.log('Payment Rec Recieved!');
            this.ProcessPayment(this.paymentRec);
        }
    }

    RecordRefund = () => {
        console.log('I will record the refund if any!!');
    }
}