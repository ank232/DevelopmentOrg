import { LightningElement, wire } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
export default class InvoiceButtons extends LightningElement {
    connectedCallback() {
        console.log("I am running!!");
        this.LineItemReciever();
    }

    @wire(MessageContext)
    messageContext;

    LineItemReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            console.log('Recieved');
            this.InvoiceButtonVisibility(message);
        });
    }
    InvoiceButtonVisibility(data) {
        const button = this.template.querySelector(".paymentButton");
        if (data.length == 0) {
            button.classList.add('slds-hide');
        } else {
            button.classList.replace("slds-hide", "slds-show");
        }
    }
    RecordPayment = () => {

    }
    RecordRefund = () => {

    }
}