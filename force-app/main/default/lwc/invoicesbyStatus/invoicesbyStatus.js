import { LightningElement, wire, api } from "lwc";
import InvoicesTotal from "@salesforce/apex/CustomerDetailsController.InvoicesTotal";
export default class InvoicesbyStatus extends LightningElement {
  @api recordId;
  paidinvoiceTotal;
  dueinvoiceTotal;
  openinvoiceTotal;
  @wire(InvoicesTotal, { companyId: "$recordId" })
  wiredInvoices({ data, error }) {
    if (data) {
      this.paidinvoiceTotal = data.Paid_Invoices__c;
      this.dueinvoiceTotal = data.OverDue_Invoices__c;
      this.openinvoiceTotal = data.Open_Invoices__c;
    }
    if (error) {
      console.log(error);
    }
  }
}
