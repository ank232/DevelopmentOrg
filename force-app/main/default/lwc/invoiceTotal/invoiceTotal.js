import InvoiceTotalMC from "@salesforce/messageChannel/InvoiceTotalMC__c";
import { subscribe, MessageContext } from "lightning/messageService";
import { LightningElement, wire } from "lwc";
import currencyType from "@salesforce/apex/CustomerDetailsController.currencyType";
export default class InvoiceTotal extends LightningElement {
  invtax;
  invsubtotal;
  invgrandtotal;
  currencytype;
  exchangerate;
  invoiceLines;
  convertedtax;
  convertedsubtotal;
  convertedgrandtotal;
  @wire(MessageContext) messageContext;
  fetchrates(targetCode) {
    currencyType({ currencyCode: targetCode })
      .then(result => {
        this.exchangerate = result.ConversionRate;
        this.showConvertedAmount();
      })
      .catch(error => {
        console.log("Failure!");
        console.log(error);
      });
  }
  connectedCallback() {
    this.MessageReciever();
  }
  MessageReciever() {
    subscribe(this.messageContext, InvoiceTotalMC, message => {
      console.log("Message recieved in Inv Total!!");
      console.log(message);
      this.currencytype = message.invoiceCurrencyCode;
      this.fetchrates(message.invoiceCurrencyCode);
      this.invoiceLines = message.invoicelines;
    });
  }
  showConvertedAmount() {
    console.log("Current rate == ", this.exchangerate);
    const exchange = this.exchangerate;
    console.log("Lines are---");
    console.log(this.invoiceLines);
    this.InvoiceTotal(this.invoiceLines, exchange);
  }
  InvoiceTotal(data, clientCurrency) {
    const taxTotal = invoiceLineItems.reduce(
      (total, lineItems) => total + parseFloat(lineItems.taxAmount),
      0.0
    );
    const subtotal = invoiceLineItems.reduce(
      (total, lineItems) => total + parseFloat(lineItems.totalAmount),
      0.0
    );
    this.invtax = taxTotal;
    this.invsubtotal = subtotal;
    this.invgrandtotal = taxTotal + subtotal;
    this.convertedsubtotal = this.invsubtotal * clientCurrency;
    this.convertedtax = this.invtax * clientCurrency;
    this.convertedgrandtotal = this.convertedsubtotal + this.convertedtax;
  }
}
