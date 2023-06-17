import { LightningElement, api } from 'lwc';
import RelatedContacts from '@salesforce/apex/CustomerDetailsController.RelatedContacts';
export default class AccountRelatedRecords extends LightningElement {
    @api recordId;

    customername(event) {
        console.log(event.target.value);
        const x = event.target.value;
        RelatedContacts({
            CompanyId: '0012w00001R41h4AAB',
            searchterm: x
        }).then(result => {
            console.log('result');
            console.log(result);
        }).catch(error => {
            console.log('Error');
            console.log(error);
        });
    }
    showContact(x) {

    }
}