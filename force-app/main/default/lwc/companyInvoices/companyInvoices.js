import { LightningElement, wire, api } from 'lwc';
import ShowInvoices from '@salesforce/apex/CustomerDetailsController.ShowInvoices';
import CUSTOMER_FIELD from '@salesforce/schema/Invoice__c.Customer__c';
import COMPANY_FIELD from '@salesforce/schema/Invoice__c.Company__c';
import PAID_DATE from '@salesforce/schema/Invoice__c.Paid_date__c';
import DUE_DATE from '@salesforce/schema/Invoice__c.Due_Date__c';
const COLS = [{
        label: 'Customer Name',
        fieldName: CUSTOMER_FIELD.fieldApiName
    },
    {
        label: 'Due Date',
        fieldName: PAID_DATE.fieldApiName
    }
];
export default class CompanyInvoices extends LightningElement {
    @api recordId;
    columns = COLS;
    invoiceData;
    // Wire method to get the list of related invoices
    @wire(ShowInvoices, { companyId: '$recordId' })
    wiredInvoices({ data, error }) {
        if (data) {
            this.invoiceData = data;
            console.log(this.invoiceData);
        }
        if (error) {
            console.log(error);
        }
    }
    connectedCallback() {

    }
}