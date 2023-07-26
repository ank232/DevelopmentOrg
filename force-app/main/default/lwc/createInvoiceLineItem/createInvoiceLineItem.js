import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import InsertLineItems from '@salesforce/apex/CreateInvoice.InsertLineItems';
import RelatedLineItems from '@salesforce/apex/CustomerDetailsController.RelatedLineItems';
export default class CreateInvoiceLineItem extends LightningElement {
    // Properties
    RelatedLineItem;
    @api isinvoicecreated;
    @api invoicerecid;
    @api recordId;
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

    // Wire methods
    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback() {
        console.log('The current Pageref(connectedcallback) ');
        console.log(this.currentPageReference.type);
        if (this.currentPageReference.type.includes("recordPage")) {
            console.log('You are on Invoice Record Page? Save Button is not visible!');
        }
    }

    get isLineItemVisible() {
        const ref = this.currentPageReference.type;
        return ref.includes('recordPage');
    }

    @wire(RelatedLineItems, { invoiceId: '$recordId' })
    LineItemData({ data, error }) {
        if (data) {
            if (data.length == 0) {
                console.log('Your line items are 0');
            }
            console.log('Related line Items are: ');
            // console.log(data);
            this.RelatedLineItems(data);
        }
        if (error) {
            this.RelatedLineItem = null;
            console.log(error);
        }
    }
    RelatedLineItems(data) {
        console.log('data');
        console.log(data);
        const prevItems = [];
        for (let item of data) {
            const reLItem = {
                ProductName: item.Product__r.Name,
                Quantity: item.Quantity__c,
                Description: item.Description__c,
                UnitAmount: item.Unit_Amount__c,
                TaxPercent: item.Tax__c,
                TaxType: item.Tax_Type__c,
                totalAmount: 0,
                taxAmount: 0
            };
            // prevItems.push(reLItem);
            this.lineItems = [...this.lineItems, reLItem];
        }
        console.log('Line Items are**');
        console.log(JSON.stringify(this.lineItems));
    }
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
        /* ---------- Event Handlers ------------*/
    handleProductName = (event) => {
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
            console.log('After Deletion->');
            console.log(this.lineItems);
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
        const currentPageRef = this.currentPageReference;
        console.log(currentPageRef);
        if (currentPageRef.type.includes('quickAction')) {
            console.log('LWC is running in Account Page');
            if (!this.isinvoicecreated && !this.invoicerecid) { //Invoice has not been saved!
                this.showNoficiation("Error", "Please Save the Invoice First", "Error");
                return;
            } else {
                if (!this.validateLineItemInput(this.lineItems)) {
                    this.showNoficiation("Error", "Please Enter proper Data", "Error");
                    return;
                }
                this.showNoficiation("Success", "Line Item will be created", "Success");
                // this.CreateLineItems(this.lineItems, this.invoicerecid);
            }
        }
        if (currentPageRef.type.includes('recordPage')) {
            console.log('LWC is running in Invoice Rec Page');
            console.log('Line Items to be Updated/Inserted');
            console.log(JSON.stringify(this.lineItems));
            const invoiceId = currentPageRef.attributes.recordId;
            if (!this.validateLineItemInput(this.lineItems)) {
                this.showNoficiation("Error", "Please Enter proper Data", "Error");
                return;
            }
            // this.showNoficiation("Success", "Line Item will be created", "Success");
            this.CreateLineItems(this.lineItems, invoiceId);
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
            if (createLineItems) {
                this.showNoficiation("Success", "Line Item will be created " + createLineItems, "Success");
            }

        } catch (error) {
            this.showNoficiation("Error", String(error), "Error");
        }
    }
}