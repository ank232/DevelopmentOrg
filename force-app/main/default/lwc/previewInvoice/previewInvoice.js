import LightningModal from 'lightning/modal';
import { api, wire } from 'lwc';
export default class PreviewInvoice extends LightningModal {
    @api message;
    confirmInv() {
        console.log(JSON.stringify(this.message));
    }
}