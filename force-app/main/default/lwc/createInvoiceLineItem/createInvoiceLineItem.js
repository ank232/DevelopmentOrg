import InsertLineItems from '@salesforce/apex/CreateInvoice.InsertLineItems';
import RelatedLineItems from '@salesforce/apex/CustomerDetailsController.RelatedLineItems';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import PRODUCT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Product__c';
import UNIT_AMOUNT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Unit_Amount__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Description__c';
import TAX_PERCENT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax__c';
import QUANTITY_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Quantity__c';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, wire } from 'lwc';
const cols = [
    { label: '', fieldName: PRODUCT_FIELD.fieldApiName },
    { label: '', fieldName: DESCRIPTION_FIELD.fieldApiName },
    { label: '', fieldName: QUANTITY_FIELD.fieldApiName },
    { label: '', fieldName: TAX_TYPE_FIELD.fieldApiName },
    { label: '', fieldName: UNIT_AMOUNT_FIELD.fieldApiName },
    { label: '', fieldName: TAX_PERCENT_FIELD.fieldApiName }
];
export default class CreateInvoiceLineItem extends LightningElement {
    COLS = cols;
    // Properties
    @api isinvoicecreated;
    @api invoicerecid;
    @api recordId;
    lineItems = [{

        ProductName: '',
        Quantity: '',
        Description: '',
        UnitAmount: '',
        TaxPercent: '',
        TaxType: '',
        totalAmount: '',
        taxAmount: ''
    }];
    // lineItems = [{}];

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
            console.log('Related line Items re:cieved ');
            console.log(data);
            this.RelatedLineItemData(data);
        }
        if (error) {
            console.log(error);
        }
    }
    RelatedLineItemData(data) {
        // console.log('data');
        for (let item of data) {
            const reLItem = {
                Id: String(this.lineItems.length + 1),
                ProductName: item.Product__c,
                Quantity: item.Quantity__c,
                Description: item.Description__c,
                UnitAmount: item.Unit_Amount__c,
                TaxPercent: item.Tax__c,
                TaxType: item.Tax_Type__c,
                totalAmount: item.Total_Amount__c,
                taxAmount: item.Tax_Amount__c
            };
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
        console.log('ProductName is---');
        console.log(event.target.value);
        const rowId = event.target.dataset.id;
        console.log('rowId');
        console.log(rowId);
        this.lineItems[rowId]['ProductName'] = event.target.value;
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

    SaveLineItem = (event) => {
        event.preventDefault();
        const currentPageRef = this.currentPageReference;
        console.log(currentPageRef);
        if (currentPageRef.type.includes('quickAction')) {
            console.log('LWC is running in Account Page');
            console.log('Line Item Data---');
            console.log(JSON.stringify(this.lineItems));
            if (!this.isinvoicecreated && !this.invoicerecid) { //Invoice has not been saved!
                this.showNoficiation("Error", "Please Save the Invoice First", "Error");
                return;
            } else {
                if (!this.validateLineItemInput(this.lineItems)) {
                    this.showNoficiation("Error", "Please Enter proper Data", "Error");
                    return;
                }
                this.CreateLineItems(this.lineItems, this.invoicerecid);
                // this.showNoficiation("Success", "Line Item will be created", "Success");
            }
        }
        if (currentPageRef.type.includes('recordPage')) {
            console.log('LWC is running in Invoice Rec Page');
            console.log('Line Items to be Updated/Inserted');
            console.log(JSON.stringify(this.lineItems));
            const invoiceId = currentPageRef.attributes.recordId;
            if (!this.validateLineItemInput(this.lineItems)) {
                console.log(this.lineItems);
                this.showNoficiation("Error", "Please Enter proper Data " + this.lineItems["Id"], "Error");
                return;
            }
            // this.showNoficiation("Success", "Line Item will be created", "Success");
            // this.CreateLineItems(this.lineItems, invoiceId);
        }
    }

    validateLineItemInput(data) {
        const validate = data.every((item) => {
            return (
                item.Description && item.ProductName && item.TaxPercent >= 0 && item.UnitAmount && item.Quantity && item.TaxType
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
        console.log('Creating Line-Items---');
        console.log(JSON.stringify(lineItemsdata));
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