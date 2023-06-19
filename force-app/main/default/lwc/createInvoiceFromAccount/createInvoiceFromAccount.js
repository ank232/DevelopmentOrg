import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import AccountRelatedRecords from 'c/accountRelatedRecords';
export default class CreateInvoiceFromAccount extends LightningElement {
    @api recordId;
    customerId;
    customerInformation;
    /*
    Getting values from child component (search contact)
     */
    handlechildEvent(event) {
            console.log('I called from child!');
            const { customerId, customerdetail } = event.detail;
            console.log('Selected Customer ID:', customerId);
            console.log('Selected Customer Details:', customerdetail);
            this.customerId = customerId;
            this.customerInformation = customerdetail;
            this.GetCustomerInfo(this.customerInformation);
        }
        /*
        Method to extract customer's information
         */
    GetCustomerInfo(customerinfo) {
            console.log('customerInfo');
            console.log(JSON.stringify(customerinfo));
            console.log('Values-->');
            console.log(customerinfo.Phone);
        }
        /*
         Method to Validate Date: Date should be in proper timeline 
         */
    validateDates(duedate, paiddate, invoicedate) {
        const dateFields = [duedate, paiddate, invoicedate];
        if (dateFields.some(field => field === null)) {
            this.showNoficiation('Error', 'Date Fields cannot be blank', 'error');
            return false;
        } else {
            let paidDate = new Date(paiddate);
            let invoiceDate = new Date(invoicedate);
            if (paidDate >= invoiceDate) {
                this.showNoficiation('Error', 'Paid Date should be atleast one day ahead of invoice Date', 'error');
                return false;
            } else {
                // this.showNoficiation('Success', 'All good!', 'success');
                return true;
            }
        }
    }
    showNoficiation(title, message, variant) {
            const showToast = new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            });
            this.dispatchEvent(showToast);
        }
        /* 
        Generate invoice =====>>> event-> onclick() 
        */
    GenerateInvoice(event) {
        event.preventDefault();
        console.log('Event happened');
        console.log(JSON.stringify(event.detail));
        const { Due_Date__c: dueDate, Paid_Date__c: paidDate, Invoice_Date__c: invoiceDate } = event.detail.fields;
        const valid = this.validateDates(dueDate, paidDate, invoiceDate);

        if (valid) {
            console.log("Can proceed further");

        } else {
            // console.log(x);
            console.log('Cannot proceed further');

        }
    }
}