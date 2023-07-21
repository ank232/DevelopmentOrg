import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import InsertLineItems from '@salesforce/apex/CreateInvoice.InsertLineItems';
export default class CreateInvoiceLineItem extends LightningElement {
    @api isinvoicecreated;
    @api invoicerecid;
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
        console.log("Parent Calling");
        const rowId = event.target.dataset.id;
        const prodName = event.detail.productName;
        const prodId = event.detail.productId;
        this.lineItems[rowId]['ProductName'] = prodId;
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
        // Method to create the lineItems and also checking whether the invoice is created or not?
    SaveLineItem = () => {
        console.log('Is Invoice Saved????');
        console.log(this.isinvoicecreated);
        console.log('Invoice iD______');
        console.log(this.invoicerecid);
        if (!this.isinvoicecreated && !this.invoicerecid) { //Invoice has not been saved!
            this.showNoficiation("Error", "Please Save the Invoice First", "Error");
            return;
        } else {
            if (!this.validateLineItemInput(this.lineItems)) {
                console.log('Not a valid input-----');
                this.showNoficiation("Error", "Please Enter proper Data", "Error");
                return;
            }
            this.showNoficiation("Success", "Line Item will be created", "Success");
            console.log('Invoice ID collected is_____==');
            console.log(this.invoicerecid);
            console.log('Line Items Collected are--');
            this.CreateLineItems(this.lineItems, this.invoicerecid);
        }
    }
    validateLineItemInput(data) {
        const validate = data.every((item) => {
            return (
                item.Description && item.ProductName && item.TaxPercent && item.UnitAmount && item.Quantity && item.TaxType
            );
        });
        return validate;
    }
    CalculateTaxAmount(row) {
        const item = this.lineItems[row];
        const unit = parseFloat(item["UnitAmount"]);
        const quant = parseInt(item["Quantity"]);
        const tax = parseInt(item["TaxPercent"]);
        if (!isNaN(unit) && !isNaN(quant) && !isNaN(tax)) {
            item["totalAmount"] = unit * quant;
            const taxAmount = (unit * (tax / 100) * quant);
            item["taxAmount"] = taxAmount;
            this.lineItems = [...this.lineItems];
        } else {
            item["totalAmount"] = 0;
            item["taxAmount"] = 0;
            this.lineItems = [...this.lineItems];
        }
    }
    async CreateLineItems(data, invoiceId) {
        console.log('Data---');
        console.log(JSON.stringify(data));
        const lineItemsdata = [];
        for (let item of data) {
            const newItem = {
                Invoice__c: invoiceId,
                Product__c: item.ProductName,
                Quantity__c: item.Quantity,
                Tax_Type__c: item.TaxType,
                Tax__c: item.TaxPercent,
                Unit_Amount__c: item.UnitAmount,
                Description__c: item.Description
            }
            lineItemsdata.push(newItem);
        }
        try {
            const createLineItems = await InsertLineItems({ LineItems: lineItemsdata });

        } catch (error) {
            this.showNoficiation("Error", String(error), "Error");
        }
    }

}