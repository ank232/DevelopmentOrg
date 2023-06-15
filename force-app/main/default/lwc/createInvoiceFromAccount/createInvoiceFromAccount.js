import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import INVOICE_OBJECT from '@salesforce/schema/Invoice__c';
import INVOICE_COMPANY_NAME_FIELD from '@salesforce/schema/Invoice__c.Company__c';
import INVOICE_CUSTOMER_NAME_FIELD from '@salesforce/schema/Invoice__c.Customer__c';
import INVOICE_STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';
import INVOICE_DUE_DATE_FIELD from '@salesforce/schema/Invoice__c.Due_Date__c';
import INVOIC_PAID_DATE_FIELD from '@salesforce/schema/Invoice__c.Paid_Date__c';
import INVOICE_DATE_FIELD from '@salesforce/schema/Invoice__c.Invoice_Date__c';
import INVOICE_NUMBER_FIELD from '@salesforce/schema/Invoice__c.Invoice_Number__c';
export default class CreateInvoiceFromAccount extends LightningElement {
    /* ------- Proprties-----------  */
    @track customerName;
    @track invoiceStatus;
    @track invoiceDate;
    @track invoiceDueDate;
    @track invoicePaidDate;
    @track invoiceNumber;
    // objectApiName = INVOICE_OBJECT;

    invoiceFields = [
        INVOICE_COMPANY_NAME_FIELD,
        INVOICE_CUSTOMER_NAME_FIELD,
        INVOICE_STATUS_FIELD,
        INVOICE_DATE_FIELD,
        INVOIC_PAID_DATE_FIELD,
        INVOICE_DUE_DATE_FIELD,
        INVOICE_NUMBER_FIELD
    ];
    handleCustomerName(event) {
        this.customerName = event.target.value;
    }
    handleInvoiceStatus(event) {
        this.invoiceStatus = event.detail.value;
    }
    handleInvoiceDueDate(event) {
        this.invoiceDueDate = event.target.value;
    }
    handleInvoicePaidDate(event) {
        this.invoicePaidDate = event.target.value;
    }
    handleInvoiceNumber(event) {
        this.invoiceNumber = event.target.value;
    }
    GenerateInvoice(event) {
        // console.log(event);
        console.log('Values---');
        console.log(this.customerName);
        console.log(this.invoiceStatus);
        console.log(this.invoicePaidDate);
        console.log(this.invoiceNumber);
        console.log(this.invoiceDueDate);
    }

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: INVOICE_STATUS_FIELD
    })
    wiredPicklistValues({ data, error }) {
        if (data) {
            this.invoiceStatus = data.values;
        }
        if (error) {
            console.log('Errorr!!! ');
        }
    }
}