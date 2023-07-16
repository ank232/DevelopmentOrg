import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import EmailPreferencesStayInTouchReminder from '@salesforce/schema/User.EmailPreferencesStayInTouchReminder';
export default class CreateInvoiceLineItem extends LightningElement {
    taxAmount;
    totalAmount
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
        const rowId = event.target.dataset.id;
        console.log('Data recieved from Child---');
        console.log(JSON.stringify(event.detail));
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
        this.lineItems.map((item) => {
            if (!item.Description) {
                console.log('Error at row---> ' + item.Id);
                this.showNoficiation(
                    "Error",
                    `Item at Row${item.Id}Field Cannot be left empty `,
                    "Error"
                );
                return;
            } else {
                console.log("VVVVVV");
                console.log(JSON.stringify(item));
                this.showNoficiation("Sucess", "I will create the line Items", "Success");
            }
        });
    }
    CalculateTaxAmount(row) {
        const unitAmount = parseFloat(this.lineItems[row]["UnitAmount"]);
        const quantity = parseFloat(this.lineItems[row]["Quantity"]);
        const taxperecnt = parseFloat(this.lineItems[row]["TaxPercent"]);
        if (!isNaN(unitAmount) && !isNaN(quantity) && !isNaN(taxperecnt)) {
            const calcluatedTax = (unitAmount * (taxperecnt / 100)) * quantity;
            this.taxAmount = calcluatedTax.toFixed(2);
            const calclulatedAmount = unitAmount * quantity;
            this.totalAmount = calclulatedAmount;
        } else {
            this.taxAmount = '';
            this.totalAmount = '';
        }
    }
}