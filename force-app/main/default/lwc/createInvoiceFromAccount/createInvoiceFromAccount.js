import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import INVOICE_OBJECT from '@salesforce/schema/Invoice__c';
// import INVOICE_COMPANY_NAME_FIELD from '@salesforce/schema/Invoice__c.Company__c';
// import INVOICE_CUSTOMER_NAME_FIELD from '@salesforce/schema/Invoice__c.Customer__c';
// import INVOICE_STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';
// import INVOICE_DUE_DATE_FIELD from '@salesforce/schema/Invoice__c.Due_Date__c';
// import INVOIC_PAID_DATE_FIELD from '@salesforce/schema/Invoice__c.Paid_Date__c';
// import INVOICE_DATE_FIELD from '@salesforce/schema/Invoice__c.Invoice_Date__c';
// import INVOICE_NUMBER_FIELD from '@salesforce/schema/Invoice__c.Invoice_Number__c';
// import INVOICE_REFERENCE_FIELD from '@salesforce/schema/Invoice__c.Reference__c';
export default class CreateInvoiceFromAccount extends LightningElement {
    /* ------- Proprties-----------  */
    @track customerName;
    @track invoiceStatus;
    @track invoiceDate;
    @track invoiceDueDate;
    @track invoicePaidDate;
    @track invoiceNumber;
    objectApiName = INVOICE_OBJECT;

    GenerateInvoice(event) {
        event.preventDefault();
        const inputFields = this.template.querySelector('lightning-input-field');
        console.log('Fields Entered--', inputFields);
    }

    // @wire(getPicklistValues, {
    //     recordTypeId: '012000000000000AAA',
    //     fieldApiName: INVOICE_STATUS_FIELD
    // })
    // wiredPicklistValues({ data, error }) {
    //     if (data) {
    //         this.invoiceStatus = data.values;
    //     }
    //     if (error) {
    //         console.log('Errorr!!! ');
    //     }
    // }
}