import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import AccountRelatedRecords from 'c/accountRelatedRecords';
import GetInvoiceDetails from '@salesforce/apex/CreateInvoice.GetInvoiceDetails';
export default class CreateInvoiceFromAccount extends LightningElement {
    @api recordId;
    customerId;
    customerInformation;
    isContactSelected = false;
    showSpinner = false;
    /*
    Getting values from child component (search contact)
     */
    handlechildEvent(event) {
        console.log(event.detail);
        console.log('I called from child!');
        const { customerId, customerdetail } = event.detail;
        console.log('Selected Customer ID:', customerId);
        console.log('Selected Customer Details:', customerdetail);
        this.customerId = customerId;
        this.isContactSelected = true;
    }
    handleNotSelected(event) {
            const detail = event.detail;
            this.showNoficiation('Waring', 'You Left the field blank ', 'Warning');
            this.isContactSelected = false;
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

    CreateInvoiceRecord(userInput) {
        console.log('*** Creating record here');
        const {
            Due_Date__c,
            Paid_Date__c,
            Invoice_Date__c,
            Invoice_Number__c,
            Status__c,
            Customer__c,
            Company__c,
            Reference_Number__c,
            Comments__c
        } = userInput;
        GetInvoiceDetails({
            status: Status__c,
            companyId: Company__c,
            customerId: Customer__c,
            invoicedate: Invoice_Date__c,
            duedate: Due_Date__c,
            paiddate: Paid_Date__c,
            comment: Comments__c,
            invoiceno: Invoice_Number__c,
            referenceno: Reference_Number__c
        }).then(
            result => {
                console.log('Created ');
                console.log(result);
            }
        ).catch(
            error => {
                console.log('Uh oh!!');
                console.log(error);
            }
        );
    }

    ResetForm() {
            const formfieldTorest = this.template.querySelectorAll('lightning-input-field');
            formfieldTorest.forEach(formfield => {
                formfield.reset();
            })
        }
        /* 
        Generate invoice =====>>> event-> onclick() 
        */
    GenerateInvoice(event) {
        event.preventDefault();
        console.log('**** Event happened');
        const userinput = event.detail.fields;
        const { Due_Date__c: dueDate, Paid_Date__c: paidDate, Invoice_Date__c: invoiceDate } = event.detail.fields;
        const valid = this.validateDates(dueDate, paidDate, invoiceDate);
        if (!this.isContactSelected) {
            this.showNoficiation('Warning', 'Please Select a Contact', 'Error');
            return;
        }
        if (valid && this.isContactSelected) {
            console.log("Can proceed further");
            userinput.Customer__c = this.customerId;
            event.target.fields = userinput;
            console.log("**************************************");
            console.log(userinput);
            // event.target.submit();
            this.showSpinner = true;
            setTimeout(() => {
                this.CreateInvoiceRecord(userinput);
                this.showSpinner = false;
            }, 300);
            console.log('Submitting user values....');
            this.showNoficiation("Success", "Invoice has been Generated", "Success");
            // this.ResetForm();
        } else {
            console.log('Cannot proceed further');
        }
    }
    handleError(event) {
        console.log('Cannot done!!');
        console.log(event);
        const errorMessage = event.detail;
        this.showNoficiation('Error', errorMessage, 'Error');
    }
    handleInvoiceLineItems(event) {
        const lineItems = event.detail;
        console.log('LineItems Recieved!!!');
        console.log(lineItems);
    }
}