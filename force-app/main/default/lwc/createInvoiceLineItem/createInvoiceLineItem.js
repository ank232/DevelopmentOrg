import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import EmailPreferencesStayInTouchReminder from '@salesforce/schema/User.EmailPreferencesStayInTouchReminder';
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
    showNoficiation(title, message, variant) {
            const showToast = new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            });
            this.dispatchEvent(showToast);
        }
        // Event Handlers:
    handleProductName = (event) => {
        console.log('Row is=====');
        const rowId = event.target.dataset.id;
        console.log('Data recieved from Child---');
        console.log(JSON.stringify(event.detail));
        const prodName = event.detail.productName;
        console.log(prodName);
        this.lineItems[rowId]['ProductName'] = prodName;
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
        console.log("YOu selected---------row==>", rowIndex);
        console.log('Related Data:');
        console.log(JSON.stringify(this.lineItems[rowIndex]));
        if (this.lineItems.length > 1) {
            this.lineItems.splice(rowIndex, 1);
            this.lineItems = [...this.lineItems];
        } else {
            this.showNoficiation('Warning', "Cannot delete all rows", "Warning");
        }
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
        this.lineItems.map((item) => {
            if (!item.Description) {
                console.log('Error at row---> ' + item.Id);
                this.showNoficiation(
                    "Error",
                    "Item at" + item.Id + "Field Cannot be left empty ",
                    "Error"
                );
                return;
            } else {
                this.showNoficiation("Sucess", "I will create the line Items", "Success");
            }
        });
    }
}