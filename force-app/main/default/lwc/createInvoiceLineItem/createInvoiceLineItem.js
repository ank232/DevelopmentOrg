import InsertLineItems from '@salesforce/apex/CreateInvoice.InsertLineItems';
import RelatedLineItems from '@salesforce/apex/CustomerDetailsController.RelatedLineItems';
import INVOICE_LINE_ITEM from '@salesforce/schema/Invoice_Line_Items__c';
import Status_field from '@salesforce/schema/Invoice__c.Status__c';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { LightningElement, api, track, wire } from 'lwc';
import { deleteRecord, getRecord } from 'lightning/uiRecordApi';
import { MessageContext, createMessageContext, publish } from 'lightning/messageService';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import { refreshApex } from '@salesforce/apex';
export default class CreateInvoiceLineItem extends LightningElement {
    // Properties
    @api isinvoicecreated;
    @api invoicerecid;
    @api recordId;
    @track lineItems = [];
    hideSaveButton;
    invoiceStatus; //  status value
    datatoRefresh; // fresh data!
    /* Wire Methods: */
    @wire(getObjectInfo, { objectApiName: INVOICE_LINE_ITEM })
    objectInfo;

    /* Wire method to get the Invoice Status */
    @wire(getRecord, { recordId: '$recordId', fields: Status_field })
    getInvoiceDetails({ data, error }) {
        if (data) {
            console.log('WIre method got the data!');
            console.log('Presenting data--');
            console.log(data.fields.Status__c.value);
            // this.invoiceStatus = data.fields.Status__c.value;
        } else if (error) {
            console.log('Error in WIre Method!!!');
            console.log(error);
        }
    }

    /* Wire Method to fetch Related LineItems */
    @wire(RelatedLineItems, { invoiceId: '$recordId' })
    LineItemData(result) {
        this.datatoRefresh = result;
        if (result.data) {
            console.log('---====---');
            // console.log(data);
            console.log(this.datatoRefresh.data);
            if (result.data.length == 0) {
                console.log('Your line items are 0');
                this.EmitInvoiceTotalMessage(result.data, this.invoiceStatus, 'WireMethod');
            } else {
                console.log('Wire got data(RelatedLines!)');
                this.RelatedLineItemData(this.datatoRefresh.data);
            }
        }
        if (result.error) {
            console.log(error);
        }
    }
    @wire(CurrentPageReference) currentPageReference;

    context = createMessageContext();

    connectedCallback() {
        if (this.currentPageReference.type.includes("recordPage")) {
            this.hideSaveButton = false;
        } else {
            this.hideSaveButton = true;
        }
    }

    /*-------------   Method to Prepare the related Data and pushing it into lineItems --------------*/
    RelatedLineItemData(data) {
        const lineData = [];
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
            lineData.push(reLItem);
        }
        this.lineItems = lineData;
        console.log("Curent Length", this.lineItems.length);
        this.EmitInvoiceTotalMessage(this.lineItems, this.invoiceStatus, 'RelatedLineItemData');
    }

    /* ---------- Event Handlers ------------*/
    handleProductName = (event) => {
        const rowId = event.target.dataset.id;
        if (!event.target.value) {
            this.showNoficiation("Message", "You left a field Blank!", "Message");
        }
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
            let itemDeleted = this.lineItems[rowIndex];
            if (this.currentPageReference.type.includes("recordPage")) { // Delete is working on Invoice Page!
                this.DeleteLineItem(itemDeleted, rowIndex);
            } else {
                if (this.lineItems.length > 1) {
                    this.DeleteLineItem(itemDeleted, rowIndex);
                    this.lineItems.splice(rowIndex, 1);
                    this.lineItems = [...this.lineItems];
                } else {
                    this.showNoficiation('Warning', "Cannot delete all rows", "Warning");
                }
            }
        }
        /*----------------------- Utility Methods---------------------*/
        /* Displaying Toast Message */
    showNoficiation(title, message, variant) {
        const showToast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(showToast);
    }

    /* Emiting the message:Payload: InvoiceLineItems , Invoice Status */
    EmitInvoiceTotalMessage(invoiceProds, invStatus, origin) {
        const payload = {
            invoicelines: invoiceProds,
            invoiceStatus: invStatus,
            fireOrigin: origin
        };
        publish(this.context, InvoiceTotalMC, payload);
    }

    /* Validating User Input Data */
    validateLineItemInput(data) {
        const validate = data.every((item) => {
            return (
                item.Description && item.ProductName &&
                item.TaxPercent >= 0 && item.UnitAmount > 0 &&
                item.Quantity && item.TaxType
            );
        });
        return validate;
    }

    /* Method to delete the LineItem from DataBase -> 
    params : item(deleteitem) | rowIndex
     */
    DeleteLineItem(itemtoBedeleted, index) {
        if (itemtoBedeleted["Id"] === undefined) {
            this.lineItems.splice(index, 1);
            this.lineItems = [...this.lineItems];
            this.EmitInvoiceTotalMessage(this.lineItems, this.invoiceStatus, 'DeleteEvent');
            this.showNoficiation("Message", "Item Removed", "Message");
        } else {
            deleteRecord(itemtoBedeleted["Id"]).then(() => {
                this.showNoficiation("Success", "Line Item Deleted", "Success");
                this.lineItems.splice(index, 1);
                this.lineItems = [...this.lineItems];
                this.EmitInvoiceTotalMessage(this.lineItems, this.invoiceStatus, 'DeleteEvent');
            }).catch((error) => {
                console.log(error);
                this.showNoficiation("Error", String(error), "Error");
            });
        }
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
            console.log(createLineItems);
            // if (createLineItems) {
            this.showNoficiation("Success", lineItemsdata.length + " Line Item saved", "Success");
            this.UpdateWire();
            // }
        } catch (error) {
            if (error.body.message.includes("Invoice is paid, you cannot edit anything")) {
                this.showNoficiation("Error", "Invoice is paid, you cannot edit LineItems", "Error");
            } else {
                console.log(error);
                this.showNoficiation("Error", error.message, "Error");
            }
        }
    }

    /* Updating wire Method to provision new data without page refresh */
    UpdateWire() {
        refreshApex(this.datatoRefresh).then(() => {
            this.showNoficiation('Message', "Data refreshed?", "Message");
        }).catch((error) => {
            console.log(error);
            this.showNoficiation("Warning", error, "Warning");
        });
    }

    /*--------- Adding a new lineItem   ------------ */
    AddLineItem = () => {
            const newItem = {
                ProductName: '',
                Quantity: '',
                UnitAmount: '',
                TaxPercent: '',
                TaxType: ''
            };
            this.lineItems = [...this.lineItems, newItem];
            if (this.currentPageReference.type.includes("recordPage")) {
                this.hideSaveButton = true;
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
            console.log('Save button is clicked');
            if (!this.validateLineItemInput(this.lineItems)) {
                this.showNoficiation("Error", "Please Enter proper Data ", "Error");
                return;
            }
            this.CreateLineItems(this.lineItems, invoiceId);
        }
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
            this.EmitInvoiceTotalMessage(this.lineItems, this.invoiceStatus, "Recalculation");
        } else {
            item["totalAmount"] = 0;
            item["taxAmount"] = 0;
            this.lineItems = [...this.lineItems];
            this.EmitInvoiceTotalMessage(this.lineItems, this.invoiceStatus, "Recalculation");
        }
    }
}