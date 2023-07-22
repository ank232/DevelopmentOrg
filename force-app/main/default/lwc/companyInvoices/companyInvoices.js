import { LightningElement, wire, api } from 'lwc';
import ShowInvoices from '@salesforce/apex/CustomerDetailsController.ShowInvoices';
import Status_FIELD from '@salesforce/schema/Invoice__c.Status__c';
import INVOICE_DATE from '@salesforce/schema/Invoice__c.Invoice_Date__c';
import Line_AMOUNT_FIELD from '@salesforce/schema/Invoice__c.Total_Line_Amount__c';
import DUE_DATE from '@salesforce/schema/Invoice__c.Due_Date__c';
import INVOICE_NO_FIELD from '@salesforce/schema/Invoice__c.Name';
const COLS = [{
        label: 'Invoice No',
        fieldName: INVOICE_NO_FIELD.fieldApiName
    },
    {
        label: 'Customer Name',
        fieldName: 'CustomerName',
        type: 'text'
    },
    {
        label: 'Status',
        fieldName: Status_FIELD.fieldApiName,
        type: 'picklist'
    },
    {
        label: 'Total Line Amount',
        fieldName: Line_AMOUNT_FIELD.fieldApiName
    },
    {
        label: 'Invoice Date',
        fieldName: INVOICE_DATE.fieldApiName
    }, {
        label: 'Due Date',
        fieldName: DUE_DATE.fieldApiName
    }
];
/*
This Component will show the related invoices for the company
*/
export default class CompanyInvoices extends LightningElement {
    @api recordId;
    columns = COLS;
    invoiceData = [];
    // Wire method to get the list of related invoices
    @wire(ShowInvoices, { companyId: '$recordId' })
    wiredInvoices({ data, error }) {
        if (data) {
            console.log("**", data);
            if (data.length == 0) {
                this.invoiceData = null;
            } else {
                this.invoiceData = data.map((invoice) => {
                    const customerName = invoice.Customer__r ? `${invoice.Customer__r.FirstName} ${invoice.Customer__r.LastName}` : 'N/A';
                    return {
                        ...invoice,
                        CustomerName: customerName
                    }
                });
            }
            //console.log(JSON.stringify(this.invoiceData));
        }
        if (error) {
            console.log("--- ------ -----  -----");
            console.log(JSON.stringify(error));
        }
    }
}