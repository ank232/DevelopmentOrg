import LightningModal from 'lightning/modal';
export default class PaymentModal extends LightningModal {
    paymentData;
    closePaymentModal = () => {
        this.close(this.paymentData);
    }
    createPaymentRecord = (event) => {
        event.preventDefault();
        this.paymentData = event.detail.fields;
    }
}