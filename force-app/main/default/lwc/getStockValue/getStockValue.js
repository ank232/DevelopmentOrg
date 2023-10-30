import { LightningElement } from "lwc";
import FetchStock from "@salesforce/apex/AlphaVantageController.FetchStock";
export default class GetStockValue extends LightningElement {
  connectedCallback() {
    this.FetchData();
  }
  FetchData() {
    FetchStock("MSFT")
      .then((response) => {
        console.log("Data--", response);
      })
      .catch((error) => {
        console.error("Not working", error.body);
      });
  }
}
