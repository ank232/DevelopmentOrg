import { LightningElement, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
export default class CreateInvoiceLineItem extends LightningElement {
    keyIndex = 0;
    lineItems = [{
        Id: '1',
        ProductName: '',
        Quantity: '',
        Description: '',
        UnitAmount: '',
        TaxPercent: ''
    }];

    @wire(getObjectInfo, { objectApiName: INVOICE_LINE_ITEM })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: TAX_TYPE_FIELD
    })
    taxPicklistValues;

    get TaxPicklistVals() {
        if (this.taxPicklistValues.data) {
            return this.taxPicklistValues.data.values.map(picklist => ({
                label: picklist.label,
                value: picklist.value
            }));
        }
        return [];
    }
    userInput() {
            const template = this.template.querySelectorAll('lightning-input');
            console.log(template);
        }
        // Event Handlers:
    handleDescription = (event) => {
        console.log("^^^^&&&&&^^^^");
        console.log(event.target.value);
    }
    handleQuantity = (event) => {
        console.log("^^^^&&&&&^^^^");
        console.log(event.target.value);
    }
    handleunitAmount = (event) => {
        console.log("^^^^&&&&&^^^^");
        console.log(event.target.value);
    }
    handleTaxType = (event) => {
        console.log("^^^^&&&&&^^^^");
        console.log(event.target.value);
    }
    handleTaxInput = (event) => {
        console.log("^^^^&&&&&^^^^");
        console.log(event.target.value);
    }
    handleDeleteLineItem = (event) => {
        this.userInput();
    }
    AddLineItem = () => {
        console.log('I clickeed!!!');
        const newItem = {
            Id: String(this.lineItems.length + 1),
            ProductName: '',
            Quantity: '',
            UnitAmount: '',
            TaxPercent: ''
        };
        this.lineItems = [...this.lineItems, newItem];
    }
}