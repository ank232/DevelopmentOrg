import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import { subscribe, MessageContext } from 'lightning/messageService';
import { LightningElement, wire } from 'lwc';
export default class InvoiceTotal extends LightningElement {
    invtax;
    invsubtotal;
    invgrandtotal;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.MessageReciever();
    }
    MessageReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            this.InvoiceTotal(message);
        });
    }

    InvoiceTotal(data) {
        const taxTotal = data.reduce((total, lineItems) => total + parseFloat(lineItems.taxAmount), 0.0);
        const subtotal = data.reduce((total, lineItems) => total + parseFloat(lineItems.totalAmount), 0.0);
        this.invtax = taxTotal;
        this.invsubtotal = subtotal;
        this.invgrandtotal = taxTotal + subtotal;
    }
}