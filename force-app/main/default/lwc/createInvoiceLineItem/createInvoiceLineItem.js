import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import INVOICE_NO_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Invoice__c'
import PRODUCT_NAME_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Product__c';
import QUANTITY_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Quantity__c';
import TAX_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax__c';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import UNIT_AMOUNT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Unit_Amount__c';
const COLS = [
    { label: 'Product Name', fieldName: 'Product__c', type: 'text', editable: true }
];
export default class CreateInvoiceLineItem extends LightningElement {
    keyIndex = 0;
    lineItems = [{
        Id: '1',
        Product__c: '',
        Quantity__c: '',
        Unit_Amount__c: '',
        Tax_Type__c: '',
        Tax_Amount__c: ''
    }];

}