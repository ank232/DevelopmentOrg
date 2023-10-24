import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class PaymentModal extends LightningModal {
    paymentData;

    closePaymentModal = () => {
        console.log('Close event orrcured');
        console.log(this.paymentData);
        if (typeof this.paymentData !== 'undefined') {
            const modalCloseEvent = new ShowToastEvent({
                title: "Success",
                message: "Payment Saved Successfully",
                variant: "Success"
            });
            this.dispatchEvent(modalCloseEvent);
            this.close({
                "paymentData": this.paymentData
            });
        } else {
            this.close({
                "paymentData": null
            });
        }
    }

    createPaymentRecord = (event) => {
        this.paymentData = event.detail.fields;
        console.log('Payment Data Saved!-> going to create--');
        // this.close(this.paymentData);
    }
    handleFlow = (event) => {
        console.log(event.detail)
        console.log('FLOW EVENT');
        console.log(event.detail.status);
    }
}