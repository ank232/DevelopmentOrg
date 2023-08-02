import InsertLineItems from '@salesforce/apex/CreateInvoice.InsertLineItems';
import RelatedLineItems from '@salesforce/apex/CustomerDetailsController.RelatedLineItems';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, track, wire } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { MessageContext, createMessageContext, publish } from 'lightning/messageService';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
export default class CreateInvoiceLineItem extends LightningElement {
    // Properties
    @api isinvoicecreated;
    @api invoicerecid;
    @api recordId;
    @track lineItems = [];
    hideSaveButton;
    context = createMessageContext();
    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback() {
        if (this.currentPageReference.type.includes("recordPage")) {
            this.hideSaveButton = false;
        } else {
            this.hideSaveButton = true;
        }
    }

    /* Wire Method to fetch Related LineItems */
    @wire(RelatedLineItems, { invoiceId: '$recordId' })
    LineItemData({ data, error }) {
        if (data) {
            if (data.length == 0) {
                console.log('Your line items are 0');
                this.EmitInvoiceTotalMessage();
            } else {
                this.RelatedLineItemData(data);
            }
        }
        if (error) {
            console.log(error);
        }
    }

    /*-------------   Method to Prepare the related Data and pushing it into lineItems --------------*/
    RelatedLineItemData(data) {
        for (let item of data) {
            const reLItem = {
                Id: item.Id,
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
        this.EmitInvoiceTotalMessage();
    }

    /* Wire Method*/
    @wire(getObjectInfo, { objectApiName: INVOICE_LINE_ITEM })
    objectInfo;

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
        const rowIndex = event.target.dataset.id;
        if (this.currentPageReference.type.includes("recordPage")) {
            let itemDeleted = this.lineItems[rowIndex];
            if (itemDeleted['Id'] === undefined) {
                this.lineItems.splice(rowIndex, 1);
                this.lineItems = [...this.lineItems];
            } else {
                this.DeleteLineItem(itemDeleted.Id);
                this.lineItems.splice(rowIndex, 1);
                this.lineItems = [...this.lineItems];
            }
        } else {
            if (this.lineItems.length > 1) {
                this.lineItems.splice(rowIndex, 1);
                this.lineItems = [...this.lineItems];
            } else {
                this.showNoficiation('Warning', "Cannot delete all rows", "Warning");
            }
        }
    }

    DeleteLineItem(itemid) {
        console.log('I am running!!!');
        const itemTobeDeleted = itemid;
        deleteRecord(itemTobeDeleted).then(() => {
            this.showNoficiation("Success", "Line Item Deleted!", "Success");
        }).catch((error) => {
            this.showNoficiation("Error", String(error), "Error");
        });
    }

    /*--------- Adding a new lineItem   ------------ */
    AddLineItem = () => {
        if (this.currentPageReference.type.includes("recordPage")) {
            this.hideSaveButton = true;
            const newItem = {
                ProductName: '',
                Quantity: '',
                UnitAmount: '',
                TaxPercent: '',
                TaxType: ''
            };
            this.lineItems = [...this.lineItems, newItem];
        } else {
            const newItem = {
                ProductName: '',
                Quantity: '',
                UnitAmount: '',
                TaxPercent: '',
                TaxType: ''
            };
            this.lineItems = [...this.lineItems, newItem];
        }
    }

    /* ----------- Inserting the LineItems into Database ----------------*/
    SaveLineItem = (event) => {
        event.preventDefault();
        const currentPageRef = this.currentPageReference;
        if (currentPageRef.type.includes('quickAction')) {
            if (!this.isinvoicecreated && !this.invoicerecid) {
                this.showNoficiation("Error", "Please Save the Invoice First", "Error");
                return;
            } else {
                if (!this.validateLineItemInput(this.lineItems)) {
                    this.showNoficiation("Error", "Please Enter proper Data", "Error");
                    return;
                }
                this.CreateLineItems(this.lineItems, this.invoicerecid);
            }
        }
        if (currentPageRef.type.includes('recordPage')) {
            const invoiceId = currentPageRef.attributes.recordId;
            if (!this.validateLineItemInput(this.lineItems)) {
                this.showNoficiation("Error", "Please Enter proper Data ", "Error");
                return;
            }
            this.CreateLineItems(this.lineItems, invoiceId);
        }
    }

    validateLineItemInput(data) {
        const validate = data.every((item) => {
            return (
                item.Description && item.ProductName &&
                item.TaxPercent >= 0 && item.UnitAmount &&
                item.Quantity && item.TaxType
            );
        });
        return validate;
    }

    CalculateTaxAmount(row) {
        const item = this.lineItems[row];
        const unit = parseFloat(item["UnitAmount"]);
        const quant = parseInt(item["Quantity"]);
        const tax = parseFloat(item["TaxPercent"]);
        if (!isNaN(unit) && !isNaN(quant) && !isNaN(tax)) {
            item["totalAmount"] = unit * quant;
            const taxAmount = (unit * (tax / 100) * quant);
            item["taxAmount"] = taxAmount.toFixed(3);
            this.lineItems = [...this.lineItems];
            this.EmitInvoiceTotalMessage();
        } else {
            item["totalAmount"] = 0;
            item["taxAmount"] = 0;
            this.lineItems = [...this.lineItems];
            this.EmitInvoiceTotalMessage();
        }
    }

    EmitInvoiceTotalMessage() {
        const payload = this.lineItems;
        publish(this.context, InvoiceTotalMC, payload);
    }

    /* Method to Insert LineItems into Database */
    async CreateLineItems(data, invoiceId) {
        const lineItemsdata = [];
        for (let item of data) {
            const newItem = {
                Id: item.Id,
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
                this.showNoficiation("Success", createLineItems + " Line Item saved", "Success");
            }
        } catch (error) {
            if (error.body.message.includes("Invoice is paid, you cannot edit anything")) {
                this.showNoficiation("Error", "Invoice is paid, you cannot edit LineItems", "Error");
            } else {
                console.log(error);
                this.showNoficiation("Error", error.message, "Error");
            }
        }
    }
}