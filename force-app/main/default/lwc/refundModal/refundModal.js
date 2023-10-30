import LightningModal from "lightning/modal";
export default class RefundModal extends LightningModal {
  refundData;

  closeRefundModal = () => {
    if (typeof this.refundData !== undefined) {
      this.close({
        refundData: this.refundData
      });
    } else {
      this.close({
        refundData: null
      });
    }
  };
  createRefund = (event) => {
    this.refundData = event.detail.fields;
  };
}
