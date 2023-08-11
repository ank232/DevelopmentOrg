import { LightningElement } from 'lwc';

export default class RefundModal extends LightningElement {
    refundData;
    closeRefundModal = () => {
        if (typeof this.refundData !== undefined) {
            this.close({
                "refundData": 'Nothing captured'
            });
        } else {
            this.close({
                "refundData": this.refundData
            });
        }
    }
    createRefund = (event) => {
        this.refundData = event.detail.fields;
    }
}