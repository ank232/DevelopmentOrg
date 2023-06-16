import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import INVOICE_STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';
/*Contoller Class*/
import CustomerDetails from '@salesforce/apex/CustomerDetailsController.CustomerDetails';
export default class CreateInvoiceFromAccount extends LightningElement {
    custName;
    customerData;

    @wire(CustomerDetails, {
        CustomerId: '$custName'
    })
    wiredCustomerDetails({ data, error }) {
        if (data) {
            this.customerData = data;
        } else if (error) {
            console.log('Error occured');
            console.log('Details---', error);
        }
    }
    handleCustomerName(event) {
        this.custName = event.detail.value[0];
    }
    GenerateInvoice(event) {
        this.haserror = false;
        event.preventDefault();
        const userInput = {};
        const requiredFields = [INVOICE_STATUS_FIELD.fieldApiName];
        const forminpt = this.template.querySelectorAll('lightning-input-field');
        if (forminpt.length == 0) {
            console.log(':(');
        }
        forminpt.forEach(inputfield => {
            const fieldName = inputfield.fieldName;
            const fieldValue = inputfield.value;
            if (requiredFields.includes(fieldName) && fieldValue == null) {
                this.haserror = true;
                // this.showerror();
            }
            userInput[fieldName] = fieldValue;
        })
        console.log('User Input');
        console.log(JSON.parse(JSON.stringify(userInput)));
        if (haserror) {
            this.ShowToast('Error', 'please fill field', 'error');
            return;
        }
    }
    showerror() {
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Please fill field',
            variant: 'error'
        });
        this.dispatchEvent(event);
    }
    ShowToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}