import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import Stauts_field from '@salesforce/schema/Invoice__c.Status__c';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    connectedCallback() {
        console.log("I am running!!");
        this.LineItemReciever();
    }
    @wire(getRecord, { recordId: '$recordId', fields: Stauts_field })
    getInvoiceDetails;

    @wire(MessageContext)
    messageContext;

    LineItemReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            console.log('Recieved');
            this.InvoiceButtonVisibility(message);
            console.log("-=>\n", this.getInvoiceDetails);
        });
    }

    InvoiceButtonVisibility(data) {
        const button = this.template.querySelector(".paymentButton");
        if (data.length == 0) {
            console.log('data has no lineItems');
            button.classList.add('slds-hide');
        } else {
            console.log('Data has linesItems??');
            console.log(data);
            button.classList.remove("slds-hide");
        }
    }

    RecordPayment = () => {
        console.log("I will record the payment");
    }

    RecordRefund = () => {
        console.log('I will record the refund if any!!');
    }
}