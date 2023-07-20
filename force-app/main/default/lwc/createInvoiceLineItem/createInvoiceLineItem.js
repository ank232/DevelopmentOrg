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
        Id: '0',
        ProductName: '',
        Quantity: '',
        Description: '',
        UnitAmount: '',
        TaxPercent: '',
        TaxType: '',
        totalAmount: '',
        taxAmount: ''
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
        const rowId = event.target.dataset.id;
        const prodName = event.detail.productName;
        console.log(prodName);
        this.lineItems[rowId]['ProductName'] = prodName;
    }
    handleDescription = (event) => {
        const row = event.target.dataset.id;
        this.lineItems[row]['Description'] = event.target.value;
    }
    handleQuantity = (event) => {
        const row = event.target.dataset.id;
        this.lineItems[row]['Quantity'] = event.target.value;
        this.CalculateTaxAmount(row);
    }
    handleunitAmount = (event) => {
        const row = event.target.dataset.id;
        this.lineItems[row]['UnitAmount'] = event.target.value;
        this.CalculateTaxAmount(row);
    }
    handleTaxType = (event) => {
        const row = event.target.dataset.id;
        this.lineItems[row]['TaxType'] = event.target.value;
    }
    handleTaxInput = (event) => {
        const row = event.target.dataset.id;
        this.lineItems[row]['TaxPercent'] = event.target.value;
        this.CalculateTaxAmount(row);

    }
    handleDeleteLineItem = (event) => {
        const rowIndex = event.target.dataset.rowIndex;
        console.log('This row--> ', rowIndex);
        if (this.lineItems.length > 1) {
            this.lineItems.splice(rowIndex, 1);
            this.lineItems = [...this.lineItems];
        } else {
            this.showNoficiation('Warning', "Cannot delete all rows", "Warning");
        }
    }
    AddLineItem = () => {
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
        const validateInput = this.lineItems.every((item) => {
            return (
                item.Description && item.ProductName && item.TaxPercent && item.UnitAmount && item.Quantity && item.TaxType
            );
        });
        if (!validateInput) {
            this.showNoficiation("Error", "Please Enter proper Data", "Error");
            return;
        }
        this.showNoficiation("Success", "Line Item will be created", "Success");
    }
    CalculateTaxAmount(row) {
        const item = this.lineItems[row];
        const unit = parseFloat(item["UnitAmount"]);
        const quant = parseInt(item["Quantity"]);
        const tax = parseInt(item["TaxPercent"]);
        if (!isNaN(unit) && !isNaN(quant) && !isNaN(tax)) {
            console.log('Amount---> ');
            console.log(unit * quant);
            item["totalAmount"] = unit * quant;
            const taxAmount = (unit * (tax / 100) * quant);
            item["taxAmount"] = taxAmount;
            console.log('Item=--->');
            console.log(JSON.stringify(this.lineItems[row]));
            this.lineItems = [...this.lineItems];
        } else {
            console.log('Somethings off');
            console.log(unit * quant);
            item["totalAmount"] = 0;
            item["totalAmount"] = 0;
            this.lineItems = [...this.lineItems];
        }
    }
}