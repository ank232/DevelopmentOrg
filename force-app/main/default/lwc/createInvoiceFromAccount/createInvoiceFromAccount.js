import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import AccountRelatedRecords from 'c/accountRelatedRecords';
export default class CreateInvoiceFromAccount extends LightningElement {
    @api recordId;
    /*
    Getting values from child component (search contact)
     */
    handlechildEvent(event) {
            console.log('I called from child!');
            const { customerId, customerdetail } = event.detail;
            console.log('Selected Customer ID:', customerId);
            console.log('Selected Customer Details:', customerdetail);
        }
        /* 
        Generate invoice =====>>> event-> onclick() 
        */
    GenerateInvoice(event) {
        event.preventDefault();
        console.log('Event happened');
        console.log(event.detail);
        const forminpt = this.template.querySelectorAll('lightning-input-field');
        if (forminpt.length == 0) {
            console.log(':(');
        }
        forminpt.forEach(inputfield => {
            const fieldName = inputfield.fieldName;
            const fieldValue = inputfield.value;
            if (!fieldValue) {
                console.log(fieldValue);
                console.log('This ', fieldName, "can't be null");
                console.log("Value Can't be null ");
            }
        })
    }
}