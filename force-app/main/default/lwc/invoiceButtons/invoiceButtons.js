import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import Status_field from '@salesforce/schema/Invoice__c.Status__c';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import PaymentModal from 'c/paymentModal';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    trueVal;
    // invoiceStatus;
    connectedCallback() {
        console.log('Connected Callback(Buttons) Ran!');
        this.LineItemReciever();
    }

    @wire(MessageContext)
    messageContext;

    /* Recieving the LMS for LineItems */
    LineItemReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            console.log('Recieved for Buttons');
            this.InvoiceButtonVisibility(message);
        });
    }

    /* Defining the Payment Button Visibility 
    Condition: if Invoice is Approved and has LineItems ?
     */
    InvoiceButtonVisibility(data) {
        console.log(data);
        // console.log('Invoice Status---> ', this.invoiceStatus);
        // console.log(data.invoicelines);
        const button = this.template.querySelector(".paymentButton");
        if (data.invoicelines.length == 0) {
            console.log('data has no lineItems');
            button.classList.add('slds-hide');
        } else {
            console.log('Something else...');
        }
        // else {
        //     if (this.invoiceStatus == 'Approved' && data.invoicelines) {
        //         console.log('Invoice status is pending and has Line Items');
        //         button.classList.remove("slds-hide");
        //     } else {
        //         console.log('Status is not Approved');
        //         console.log(this.invoiceStatus);
        //         button.classList.add('slds-hide');
        //     }
        // }
    }

    async RecordPayment() {
        this.trueVal = true;
        console.log("I will record the payment");
        const res = await PaymentModal.open({

        });
        console.log(res);

    }

    RecordRefund = () => {
        console.log('I will record the refund if any!!');
    }
}