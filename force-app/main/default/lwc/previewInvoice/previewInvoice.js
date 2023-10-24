import LightningModal from 'lightning/modal';
import { api, wire } from 'lwc';
import RelatedLineItems from '@salesforce/apex/CustomerDetailsController.RelatedLineItems';
export default class PreviewInvoice extends LightningModal {
    @api message;
    invoiceId;
    invoiceLines;
    connectedCallback() {
        console.log('MODAL INSERTED');
        console.log(JSON.stringify(this.message));
        this.invoiceId = this.message[0].Id;
        console.log('Invoice Id!!!', this.invoiceId);
        this.ProductLines();
    }
    ProductLines() {
        RelatedLineItems({ invoiceId: this.invoiceId }).then((result) => {
            console.log('Related Lines-->');
            console.log(JSON.stringify(result));
            this.invoiceLines = result;
        }).catch((err) => {
            console.log('Not Done :(');
        });
    }
    disconnectedCallback(){
        console.log('I will reset the values');
        this.invoiceLines= null;
        this.invoiceId = null;
        this.message= null;
    }
}