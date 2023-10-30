import LightningModal from "lightning/modal";

export default class ExchangeRateModal extends LightningModal {
  fromISOcode;
  toISOcode;
  exhangecurrencyData;
  fromCurrency = (event) => {
    // console.log(event.detail);
    this.fromISOcode = event.detail.value;
  };
  toCurrency = (event) => {
    this.toISOcode = event.detail.value;
  };
  closeModal = () => {
    if (this.exhangecurrencyData !== undefined) {
      this.close({
        data: this.exhangecurrencyData
      });
    } else {
      this.close({
        data: null
      });
    }
  };
  saveResult = (event) => {
    event.preventDefault();
    console.log("Save--");
    this.exhangecurrencyData = {
      from: this.fromISOcode,
      to: this.toISOcode
    };
  };
}
