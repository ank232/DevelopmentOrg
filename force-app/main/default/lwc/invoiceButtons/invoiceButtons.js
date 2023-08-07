import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import Status_field from '@salesforce/schema/Invoice__c.Status__c';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import PaymentModal from 'c/paymentModal';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    trueVal;
    paymentRec;

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
                const maxAmnt = data.invoicelines.reduce((total, lineitem) => total + lineitem.totalAmount, 0.0);
                console.log('Max Amount0-->', maxAmnt);
            }
        }
    }

    ProcessPayment = (paymentData) => {
        const AmounttoPaid = paymentData["Amount__c"];
        console.log('You enter this amount-->', AmounttoPaid);
    }

    async RecordPayment() {
        this.trueVal = true;
        await PaymentModal.open({
            size: 'Small'
        }).then((result) => {
            console.log('_+_+_+_+_');
            console.log(result);
            console.log('_+_+_+_+_');
            this.paymentRec = result;
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