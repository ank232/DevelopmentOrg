import { LightningElement, track, wire } from 'lwc';
import {
    getPicklistValues
} from 'lightning/uiObjectInfoApi';
import INVOICE_STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';
export default class CreateInvoiceFromAccount extends LightningElement {

    @track customerName = '';
    @track invoiceStatus;

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: INVOICE_STATUS_FIELD
    })
    wiredPicklistValues({ data, error }) {
        if (data) {
            console.log('PickList Values---', data);
            this.invoiceStatus = data.values;
            console.log('PickList------', this.invoiceStatus);
        }
        if (error) {
            console.log('Errorr!!! ');
        }
    }
}