import InsertLineItems from "@salesforce/apex/CreateInvoice.InsertLineItems";
import RelatedLineItems from "@salesforce/apex/CustomerDetailsController.RelatedLineItems";
import INVOICE_LINE_ITEM from "@salesforce/schema/Invoice_Line_Items__c";
import Status_field from "@salesforce/schema/Invoice__c.Status__c";
import INVOICE_CURRENCY from "@salesforce/schema/Invoice__c.CurrencyIsoCode";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { LightningElement, api, track, wire } from "lwc";
import { deleteRecord, getRecord } from "lightning/uiRecordApi";
import { createMessageContext, publish } from "lightning/messageService";
import InvoiceTotalMC from "@salesforce/messageChannel/InvoiceTotalMC__c";
import { refreshApex } from "@salesforce/apex";
import { makeCurrency, destructCurrency } from "./utility";
export default class CreateInvoiceLineItem extends LightningElement {
  // Properties
  @api isinvoicecreated;
  @api invoicerecid;
  @api recordId;
  @track lineItems = [];
  hideSaveButton;
  invoiceStatus; //  status value
  datatoRefresh; // fresh data!
  @track _invoiceCurrency;

  /* Wire Methods: */
  @wire(getObjectInfo, { objectApiName: INVOICE_LINE_ITEM })
  objectInfo;

  /* Wire method to get the Invoice Status */
  @wire(getRecord, {
    recordId: "$recordId",
    fields: [Status_field, INVOICE_CURRENCY]
  })
  /**
   * Description
   * @param {any} {data
   * @param {any} error}
   * @returns {any}
   */
  getInvoiceDetails({ data, error }) {
    if (data) {
      this._invoiceCurrency = data.fields.CurrencyIsoCode.value;
      this.invoiceStatus = data.fields.Status__c.value;
    } else if (error) {
      console.log("Error in WIre Method!!!");
      console.log(error);
    }
  }

  /* Wire Method to fetch Related LineItems */
  @wire(RelatedLineItems, { invoiceId: "$recordId" })
  LineItemData(result) {
    this.datatoRefresh = result;
    if (result.data) {
      if (result.data.length == 0) {
        this.EmitInvoiceTotalMessage(
          result.data,
          this.invoiceStatus,
          "No Data Found",
          this._invoiceCurrency
        );
      } else {
        this.RelatedLineItemData(this.datatoRefresh.data);
      }
    }
    if (result.error) {
      console.log("Error Occured");
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
        UnitAmount: makeCurrency(item.Unit_Amount__c, this._invoiceCurrency),
        TaxPercent: item.Tax__c,
        TaxType: item.Tax_Type__c,
        totalAmount: item.Total_Amount__c,
        taxAmount: item.Tax_Amount__c ,
        stripePrice:item.Product__r.Stripe_Price_Id__c
      };
      lineData.push(reLItem);
    }
    this.lineItems = lineData;
    this.EmitInvoiceTotalMessage(
      this.lineItems,
      this.invoiceStatus,
      "RelatedLineItemData",
      this._invoiceCurrency // this.rate
    );
  }
  /* ---------- Event Handlers ------------*/
  handleFocus = (event) => {
    const row = event.target.dataset.id;
    const normalval = destructCurrency(event.target.value);
    this.lineItems[row]["UnitAmount"] = normalval;
  };
  formatAmount = (event) => {
    const row = event.target.dataset.id;
    console.log("Focus Released!");
    console.log(event.target.value);
    this._invoiceCurrency = this._invoiceCurrency
      ? this._invoiceCurrency
      : "USD";
    this.lineItems[row]["UnitAmount"] = makeCurrency(
      event.target.value,
      this._invoiceCurrency
    );
  };
  handleProductName = (event) => {
    const rowId = event.target.dataset.id;
    if (!event.target.value) {
      this.showNoficiation("Message", "You left a field Blank!", "Message");
    }
    this.lineItems[rowId]["ProductName"] = event.target.value;
  };

  handleDescription = (event) => {
    const row = event.target.dataset.id;
    this.lineItems[row]["Description"] = event.target.value;
  };
  handleQuantity = (event) => {
    const row = event.target.dataset.id;
    this.lineItems[row]["Quantity"] = event.target.value;
    this.CalculateTaxAmount(row);
  };

  handleunitAmount = (event) => {
    console.log("Onchange Event occured!");
    const row = event.target.dataset.id;
    const value = event.target.value;
    console.log("You entered=", value);
    this.lineItems[row]["UnitAmount"] = event.target.value;
    this.CalculateTaxAmount(row);
  };
  handleTaxType = (event) => {
    const row = event.target.dataset.id;
    this.lineItems[row]["TaxType"] = event.target.value;
  };

  handleTaxInput = (event) => {
    const row = event.target.dataset.id;
    this.lineItems[row]["TaxPercent"] = event.target.value;
    this.CalculateTaxAmount(row);
  };
  handleDeleteLineItem = (event) => {
    const rowIndex = event.target.dataset.id;
    let itemDeleted = this.lineItems[rowIndex];
    if (this.currentPageReference.type.includes("recordPage")) {
      // Delete is working on Invoice Page!
      this.DeleteLineItem(itemDeleted, rowIndex);
    } else {
      if (this.lineItems.length > 1) {
        this.DeleteLineItem(itemDeleted, rowIndex);
        this.lineItems.splice(rowIndex, 1);
        this.lineItems = [...this.lineItems];
      } else {
        this.showNoficiation("Warning", "Cannot delete all rows", "Warning");
      }
    }
  };
  /*----------------------- Utility Methods---------------------*/
  /**
   * Description
   * @param {any} title
   * @param {any} message
   * @param {any} variant
   * @returns {any}
   */
  showNoficiation(title, message, variant) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(showToast);
  }

  /* Emiting the message:Payload: InvoiceLineItems , Invoice Status */
  EmitInvoiceTotalMessage(
    invoiceProds,
    invStatus,
    origin,
    invoiceCurrency,
    exchangeRate
  ) {
    const payload = {
      invoicelines: invoiceProds,
      invoiceStatus: invStatus,
      fireOrigin: origin,
      invoiceCurrencyCode: invoiceCurrency,
      exchangeRate: exchangeRate
    };
    publish(this.context, InvoiceTotalMC, payload);
  }

  /* Validating User Input Data */
  validateLineItemInput(data) {
    const validate = data.every((item) => {
      item.UnitAmount = destructCurrency(item.UnitAmount);
      console.log(item.UnitAmount);
      return (
        item.Description &&
        item.ProductName &&
        item.TaxPercent >= 0 &&
        item.UnitAmount > 0 &&
        item.Quantity &&
        item.TaxType
      );
    });
    return validate;
  }

  /**
   * Description
   * @param {any} itemtoBedeleted
   * @param {any} index
   * @returns {any}
   */
  DeleteLineItem(itemtoBedeleted, index) {
    if (itemtoBedeleted["Id"] === undefined) {
      this.lineItems.splice(index, 1);
      this.lineItems = [...this.lineItems];
      this.EmitInvoiceTotalMessage(
        this.lineItems,
        this.invoiceStatus,
        "DeleteEvent"
      );
      this.showNoficiation("Message", "Item Removed", "Message");
    } else {
      deleteRecord(itemtoBedeleted["Id"])
        .then(() => {
          this.showNoficiation("Success", "Line Item Deleted", "Success");
          this.lineItems.splice(index, 1);
          this.lineItems = [...this.lineItems];
          this.EmitInvoiceTotalMessage(
            this.lineItems,
            this.invoiceStatus,
            "DeleteEvent"
          );
        })
        .catch((error) => {
          console.log(error);
          this.showNoficiation(
            "Error",
            error.body.output.errors[0].message,
            "Error"
          );
        });
    }
  }

  /**
   * Description
   * @param {any} data
   * @param {any} invoiceId
   * @returns {any}
   */
  async CreateLineItems(data, invoiceId) {
    console.log("Creating Items!");
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
      };
      lineItemsdata.push(newItem);
    }
    try {
      const createLineItems = await InsertLineItems({
        LineItems: lineItemsdata
      });
      console.log(createLineItems);
      // if (createLineItems) {
      this.showNoficiation(
        "Success",
        lineItemsdata.length + " Line Item saved",
        "Success"
      );
      this.UpdateWire();
      // }
    } catch (error) {
      if (
        error.body.message.includes("Invoice is paid, you cannot edit anything")
      ) {
        this.showNoficiation(
          "Error",
          "Invoice is paid, you cannot edit LineItems",
          "Error"
        );
      } else {
        console.log(error);
        this.showNoficiation("Error", error.message, "Error");
      }
    }
  }

  /* Updating wire Method to provision new data without page refresh */
  UpdateWire() {
    refreshApex(this.datatoRefresh)
      .then(() => {
        this.showNoficiation("Message", "Data has been refreshed", "Message");
      })
      .catch((error) => {
        console.log(error);
        this.showNoficiation("Warning", error, "Warning");
      });
  }

  /*--------- Adding a new lineItem   ------------ */
  AddLineItem = () => {
    const newItem = {
      ProductName: "",
      Quantity: "",
      UnitAmount: "",
      TaxPercent: "",
      TaxType: ""
    };
    this.lineItems = [...this.lineItems, newItem];
    if (this.currentPageReference.type.includes("recordPage")) {
      this.hideSaveButton = true;
    }
  };
  /* ----------- Inserting the LineItems into Database ----------------*/
  SaveLineItem = (event) => {
    event.preventDefault();
    const currentPageRef = this.currentPageReference;
    if (currentPageRef.type.includes("quickAction")) {
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
    if (currentPageRef.type.includes("recordPage")) {
      const invoiceId = currentPageRef.attributes.recordId;
      console.log("Save button is clicked");
      if (!this.validateLineItemInput(this.lineItems)) {
        this.showNoficiation("Error", "Please Enter proper Data ", "Error");
        return;
      }
      this.CreateLineItems(this.lineItems, invoiceId);
    }
  };

  /**
   * Description
   * @param {any} row
   * @returns {any}
   */
  CalculateTaxAmount(row) {
    const item = this.lineItems[row];
    const unit = destructCurrency(item["UnitAmount"]);
    const quant = parseInt(item["Quantity"]);
    const tax = parseFloat(item["TaxPercent"]);
    if (!isNaN(unit) && !isNaN(quant) && !isNaN(tax)) {
      item["totalAmount"] = unit * quant;
      const taxAmount = unit * (tax / 100) * quant;
      item["taxAmount"] = taxAmount.toFixed(3);
      this.lineItems = [...this.lineItems];
      this.EmitInvoiceTotalMessage(
        this.lineItems,
        this.invoiceStatus,
        "Recalculation",
        this._invoiceCurrency,
        this.rate
      );
    } else {
      item["totalAmount"] = 0;
      item["taxAmount"] = 0;
      this.lineItems = [...this.lineItems];
      this.EmitInvoiceTotalMessage(
        this.lineItems,
        this.invoiceStatus,
        "Null Amount",
        this._invoiceCurrency,
        this.rate
      );
    }
  }
}
