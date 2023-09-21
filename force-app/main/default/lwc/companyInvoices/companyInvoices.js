import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ShowInvoices from '@salesforce/apex/CustomerDetailsController.ShowInvoices';
import Status_FIELD from '@salesforce/schema/Invoice__c.Status__c';
import INVOICE_DATE from '@salesforce/schema/Invoice__c.Invoice_Date__c';
import Line_AMOUNT_FIELD from '@salesforce/schema/Invoice__c.Total_Line_Amount__c';
import DUE_DATE from '@salesforce/schema/Invoice__c.Due_Date__c';
import INVOICE_NO_FIELD from '@salesforce/schema/Invoice__c.Name';
const actions = [
    { label: 'View', name: 'view' },
    { label: 'Delete', name: 'delete' },
];
const COLS = [{
    label: 'Invoice No',
    fieldName: 'InvoiceNO',
    type: 'url',
    typeAttributes: { label: { fieldName: INVOICE_NO_FIELD.fieldApiName }, target: '_blank' }
},
{
    label: 'Customer Name',
    fieldName: 'CustomerName',
    type: 'text'
},
{
    label: 'Status',
    fieldName: Status_FIELD.fieldApiName,
    type: 'text',
    typeAttributes: '10px',
    cellAttributes: { class: { fieldName: 'StatusBadgeClass' } }
},
{
    label: 'Total Line Amount',
    fieldName: Line_AMOUNT_FIELD.fieldApiName,
    type: 'currency'
},
{
    label: 'Invoice Date',
    fieldName: INVOICE_DATE.fieldApiName,
    type: 'date'
}, {
    label: 'Due Date',
    fieldName: DUE_DATE.fieldApiName,
    type: 'date'
},
{
    // label: 'Action',
    type: 'action',
    initialWidth: '50px',
    typeAttributes: { rowActions: actions },
}
];
/*
This Component will show the related invoices for the company
*/
export default class CompanyInvoices extends NavigationMixin(LightningElement) {
    @api recordId;
    columns = COLS;
    invoiceData = [];
    // Wire method to get the list of related invoices
    @wire(ShowInvoices, { companyId: '$recordId' })
    wiredInvoices({ data, error }) {
        if (data) {
            if (data.length == 0) {
                this.invoiceData = null;
            } else {
                console.log(data);
                this.invoiceData = data.map((invoice) => {
                    const customerName = invoice.Customer__r ? `${invoice.Customer__r.FirstName} ${invoice.Customer__r.LastName}` : 'N/A';
                    const InvoiceNO = `/${invoice.Id}`;
                    let invoiceStatusbadge = 'slds-badge';
                    let invoiceAmount;
                    if (invoice.Status__c === 'Approved') {
                        invoiceStatusbadge = 'slds-badge slds-theme_success';
                    }
                    if (invoice.Status__c === 'Cancelled') {
                        invoiceStatusbadge = 'slds-badge slds-theme_error';
                    }
                    if (invoice.Status__c === 'Pending') {
                        invoiceStatusbadge = 'slds-badge slds-theme_warning';
                    }      
                    console.log('Invoice Amount-> ',invoice.Total_Line_Amount__c);
                    return {
                        ...invoice,
                        InvoiceNO,
                        CustomerName: customerName,
                        StatusBadgeClass: invoiceStatusbadge,
                        InvAmount: invoiceAmount
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
    Rowmenu = (event) => {
        console.log('You selected a row!!');
        const row = event.detail.row;
        const actionName = event.detail.action.name;

        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'delete':
                this.showNoficiation("Message", "Invoice " + row.Name + " is deleted", "Message");
                break;
            default:
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
}