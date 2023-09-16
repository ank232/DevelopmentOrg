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
        console.log(JSON.stringify(error));
        this.exchangerate = '$';        
      });
  }
  connectedCallback() {
    this.MessageReciever();
  }
  MessageReciever() {
    subscribe(this.messageContext, InvoiceTotalMC, message => {      
      this.currencytype = message.invoiceCurrencyCode;
      this.fetchrates(message.invoiceCurrencyCode);
      this.invoiceLines = message.invoicelines;
    });
  }
  showConvertedAmount() {    
    const exchange = this.exchangerate;
    this.InvoiceTotal(this.invoiceLines, exchange);
  }
  InvoiceTotal(data, clientCurrency) {
    console.log(clientCurrency);
    const taxTotal = data.reduce(
      (total, lineItems) => total + this.desctructcurrency(lineItems.taxAmount),
      0.0
    );
    data.forEach((lineItem) => {
      if (typeof lineItem.totalAmount === 'string') {
        lineItem.totalAmount = parseFloat(lineItem.totalAmount);
      }
    });
    // this.convertedgrandtotal = this.convertedsubtotal + this.convertedt
    const subtotal = data.reduce(
      (total, lineItem) => total + lineItem.totalAmount, 0.00);
    this.invtax = taxTotal;
    this.invsubtotal = subtotal;
    this.invgrandtotal = taxTotal + subtotal;
    // this.convertedsubtotal = this.invsubtotal * clientCurrency;
    // this.convertedtax = this.invtax * clientCurrency;ax;
  }

  desctructcurrency(value) {
    const hasCurrencySymbol = /[^\d.,]/.test(value);
    if (hasCurrencySymbol) {
      // Remove non-numeric characters except for periods and commas
      const numericPart = value.replace(/[^\d.,]/g, '');
      // Replace commas with empty strings
      const numericValue = numericPart.replace(/,/g, '');
      // Parse the numeric value as a floating-point number
      return parseFloat(numericValue);
    } else {
      // The value does not contain a currency symbol, so it's a currency code
      return parseFloat(value) || 0; // Convert the value to a number, or return 0 if it's not a valid number
    }
    // return parseFloat(value.replace(/[^0-9,-]/g, ""));
  }
}
