import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import Status_field from '@salesforce/schema/Invoice__c.Status__c';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    connectedCallback() {
        this.LineItemReciever();
    }
    @wire(getRecord, { recordId: '$recordId', fields: Status_field })
    getInvoiceDetails;

    @wire(MessageContext)
    messageContext;

    LineItemReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            console.log('Recieved for Buttons');
            // this.InvoiceButtonVisibility(message);
            // console.log("-=>\n", this.getInvoiceDetails);
        });
    }
    A
    InvoiceButtonVisibility(data) {
        const button = this.template.querySelector(".paymentButton");
        if (data.length == 0) {
            console.log('data has no lineItems');
            button.classList.add('slds-hide');
        } else {
            console.log(data);
            if (data.length != 0 && data[1] == 'Paid') {
                console.log('Data has linesItems?? and the inv is Paid??');
                console.log(data);
                button.classList.remove("slds-hide");
            }
        }
    }

    RecordPayment = () => {
        console.log("I will record the payment");
    }

    RecordRefund = () => {
        console.log('I will record the refund if any!!');
    }
}