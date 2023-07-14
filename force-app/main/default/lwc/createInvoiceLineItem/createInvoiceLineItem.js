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
        TaxPercent: '',
        TaxType: ''
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
    handleProductName = (event) => {
        console.log('Row is=====');
        console.log(event.target.dataset.id);
        console.log('Data recieved from Child---');
        console.log(JSON.stringify(event.detail));
        const prodName = event.detail.productName;
        console.log(prodName);
    }
    handleDescription = (event) => {
        console.log(event.target.value);
        const row = event.target.dataset.id;
        console.log(row);
        this.lineItems[row]['Description'] = event.target.value;
    }
    handleQuantity = (event) => {
        console.log(event.target.value);
    }
    handleunitAmount = (event) => {
        console.log(event.target.value);
    }
    handleTaxType = (event) => {
        console.log(event.target.value);
        const row = event.target.dataset.id;
        console.log('Row----');
        console.log(row);
        this.lineItems[row]['TaxType'] = event.target.value;
    }
    handleTaxInput = (event) => {
        console.log(event.target.value);
    }
    handleDeleteLineItem = (event) => {
        console.log('I will delete the row');
        const rowIndex = event.target.dataset.rowIndex;
        console.log("YOu selected---------", rowIndex);
        console.log('Related Data:');
        console.log(JSON.stringify(this.lineItems[rowIndex]));
    }
    AddLineItem = () => {
        console.log('I clickeed!!!');
        const newItem = {
            Id: String(this.lineItems.length + 1),
            ProductName: '',
            Quantity: '',
            UnitAmount: '',
            TaxPercent: '',
            TaxType: ''
        };
        this.lineItems = [...this.lineItems, newItem];
    }
    SaveLineItem = () => {
        console.log('I will save the data');
        console.log(JSON.stringify(this.lineItems));
    }
}