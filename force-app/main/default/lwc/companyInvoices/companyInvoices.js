import { LightningElement, wire, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ShowInvoices from "@salesforce/apex/CustomerDetailsController.ShowInvoices";
import Status_FIELD from "@salesforce/schema/Invoice__c.Status__c";
import INVOICE_DATE from "@salesforce/schema/Invoice__c.Invoice_Date__c";
import Line_AMOUNT_FIELD from "@salesforce/schema/Invoice__c.Total_Line_Amount__c";
import DUE_DATE from "@salesforce/schema/Invoice__c.Due_Date__c";
import INVOICE_NO_FIELD from "@salesforce/schema/Invoice__c.Name";
import INVOICE_CURRENCY_FIELD from "@salesforce/schema/Invoice__c.CurrencyIsoCode";
import PreviewInvoice from "c/previewInvoice";
const actions = [
  { label: "View", name: "view" },
  { label: "Delete", name: "delete" }
];
const COLS = [
  {
    label: "Invoice No",
    fieldName: "InvoiceNO",
    type: "url",
    typeAttributes: {
      label: { fieldName: INVOICE_NO_FIELD.fieldApiName },
      target: "_blank"
    }
  },
  {
    label: "Customer Name",
    fieldName: "CustomerName",
    type: "text"
  },
  {
    label: "Status",
    fieldName: Status_FIELD.fieldApiName,
    type: "text",
    typeAttributes: "10px"
    // cellAttributes: { class: { fieldName: 'StatusBadgeClass' } }
  },
  {
    label: "Currency",
    fieldName: INVOICE_CURRENCY_FIELD.fieldApiName,
    type: "text"
  },
  {
    label: "Total Line Amount",
    fieldName: Line_AMOUNT_FIELD.fieldApiName,
    type: "currency"
  },
  {
    label: "Invoice Date",
    fieldName: INVOICE_DATE.fieldApiName,
    type: "date"
  },
  {
    label: "Due Date",
    fieldName: DUE_DATE.fieldApiName,
    type: "date"
  },
  {
    // label: 'Action',
    type: "action",
    initialWidth: "50px",
    typeAttributes: { rowActions: actions }
  }
];
/*
This Component will show the related invoices for the company
*/
export default class CompanyInvoices extends NavigationMixin(LightningElement) {
  @api recordId;
  columns = COLS;
  invoiceData = [];
  selectedRowData;
  connectedCallback() {
    console.log("Connected Running");
  }
  // Wire method to get the list of related invoices
  @wire(ShowInvoices, { companyId: "$recordId" })
  wiredInvoices({ data, error }) {
    if (data) {
      if (data.length == 0) {
        this.invoiceData = null;
      } else {
        console.log(data);
        this.invoiceData = data.map(invoice => {
          const customerName = invoice.Customer__r
            ? `${invoice.Customer__r.FirstName} ${invoice.Customer__r.LastName}`
            : "N/A";
          const InvoiceNO = `/${invoice.Id}`;
          let invoiceAmount;
          return {
            ...invoice,
            InvoiceNO,
            CustomerName: customerName,
            InvAmount: invoiceAmount
          };
        });
      }
      //console.log(JSON.stringify(this.invoiceData));
    }
    if (error) {
      console.log("--- ------ -----  -----");
      console.log(JSON.stringify(error));
    }
  }
  Rowmenu = event => {
    console.log("You selected a row!!");
    const row = event.detail.selectedRows;
    console.log(JSON.stringify(row));
    this.selectedRowData = row;
  };
  showNoficiation(title, message, variant) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(showToast);
  }
  async sendAction() {
    // console.log("Sending Action;;;;");
    // console.log(this.selectedRowData);
    if (
      this.selectedRowData.length == 0 ||
      typeof this.selectedRowData == "undefined"
    ) {
      console.log("Modal WIll Not open");
    } else {
      console.log("OPENING MODAL");
      await PreviewInvoice.open({
        label: "Test Modal",
        size: "large",
        description: "invoice Summary",
        message: this.selectedRowData
      }).catch(error => {
        console.log("Error in Invoice Modal");
        console.log(error);
      });
    }
  }
  // else{
  //     console.log('ELSE');
  //     console.log(this.selectedRowData);
  // }
  // sendAction = (event) => {
  //     console.log('Action(Send)');
  //     console.log('selected invoices are');
  //     console.log(this.selectedRowData);
  //     if (!this.selectedRowData) {
  //         this.showNoficiation("Message", "Plese Select invoice(s) first", "Message");
  //         return;
  //     }
  //     console.log();
  // }
  rowAction = event => {
    const rowId = event.detail.row.Id;
    const rowNumber = event.detail.row.Name;
    const actionName = event.detail.action.name;
    switch (actionName) {
      case "view":
        this[NavigationMixin.Navigate]({
          type: "standard__recordPage",
          attributes: {
            recordId: rowId,
            actionName: "view"
          }
        });
        break;
      case "delete":
        this.showNoficiation(
          "Message",
          "Invoice " + rowNumber + " is deleted",
          "Message"
        );
        break;
      default:
    }
  };
}
