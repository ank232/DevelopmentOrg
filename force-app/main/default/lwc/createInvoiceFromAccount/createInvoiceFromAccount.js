import { LightningElement, api, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import INVOICE_OBJECT from '@salesforce/schema/Invoice__c';
import { getRecord } from 'lightning/uiRecordApi';
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
    customerName;
    invoiceStatus;
    invoiceDate;
    invoiceDueDate;
    nvoicePaidDate;
    invoiceNumber;
    objectApiName = INVOICE_OBJECT;
    customerId;
    customerData = {};
    // @wire(getRecord, { recordId: '$customerId', fields: ['Customer__r.Name, Customer__r.Email'] })
    // customerRecord({ error, data }) {
    //     if (data) {
    //         this.customerData = data.fields;
    //     } else if (error) {

    //     }
    // }
    handleCustomerDetail(event) {
        const recordtest = event.detail.records[this.objectApiName];
        this.customerId = recordtest.fields.Customer__c.value;
        console.log('-- -- --');
        console.log(this.customerId);
    }
    GenerateInvoice(event) {
        event.preventDefault();
        const formInputs = this.template.querySelectorAll('lightning-input-field');
        formInputs.forEach(inputfield => {
            console.log('FieldName=');
            console.log(inputfield.fieldName);
            console.log(inputfield.value);
        });
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