import { LightningElement } from 'lwc';
import LightningModal from 'lightning/modal';
export default class PaymentModal extends LightningModal {

    closePaymentModal = () => {
        this.close("close");
    }
    createPaymentRecord = (event) => {
        event.preventDefault();
        console.log('Save Event occured!');
        console.log(event.detail.fields);
    }
}