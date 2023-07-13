import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
export default class CreateInvoiceLineItem extends LightningElement {
    keyIndex = 0;
    TaxPicklistVals = [];
    lineItems = [{
        Id: '1',
        ProductName: '',
        Quantity: '',
        Description: '',
        UnitAmount: '',
        TaxPercent: ''
    }];
    @wire(getPicklistValues, { fieldApiName: TAX_TYPE_FIELD })
    LineItemPickListVals({ data, error }) {
        if (data) {
            console.log('-----------------');
            console.log(data);
        }
        if (error) {
            console.log('XXXXXXXXXXXXXXXXXXXX');
        }
    }
    connectedCallback() {
        console.log(TAX_TYPE_FIELD);
    }
}