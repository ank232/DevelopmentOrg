import { LightningElement, api } from 'lwc';
import RelatedContacts from '@salesforce/apex/CustomerDetailsController.RelatedContacts';
import allContacts from '@salesforce/apex/CustomerDetailsController.allContacts';
export default class AccountRelatedRecords extends LightningElement {
    /*
    ========>>>>>>>>   Properties <<<<<<<<========
     */
    @api recordId;
    searchResults = [];
    contactMap = {};
    searchQuery;
    hascontacts;
    contactData;
    selectedcontactId;
    customerInfo;
    showinfo;
    // Connected Callback -> invoking allContacts apex method to fetch all contacts using accountId
    connectedCallback() {
            allContacts({
                CompanyId: this.recordId
            }).then(result => {
                if (result.length == 0) {
                    console.log('This account has no contacts!');
                    this.hascontacts = false;
                } else {
                    console.log('Account as contact(s)');
                    console.log(result);
                    this.contactData = result;
                }
            }).catch(error => {
                console.log(error);
            });
        }
        // event for user input -> it will check if its null or not
    customername(event) {
            this.searchQuery = event.target.value;
            console.log('Input Value==');
            console.log('this.searchQuery ', this.searchQuery);
            if (!this.searchQuery) {
                console.log('its empty; it should not display the contacts');
                // Setting hiscontacts to false , as userinput is empty
                this.hascontacts = false;
                this.searchResults = [];
            } else {
                // We got user input and now calling -> RelatedContacts() apex method. 
                console.log('Its not empty; it should display the contacts');
                RelatedContacts({
                    CompanyId: this.recordId,
                    searchterm: this.searchQuery
                }).then(result => {
                    // Checking if the result contains contacts or not.
                    if (result.length == 0) {
                        console.log('No result found');
                        this.hascontacts = false;
                        this.searchResults = undefined;
                    } else {
                        // putting the result into searchResult and making hascontacts to true
                        console.log('Contacts Found');
                        this.hascontacts = true;
                        this.searchResults = result;
                    }
                }).catch(error => {
                    console.log('Error');
                    console.log(error);
                });
            }
        }
        // This event handler will give me the selected contactId
    handleCustomerinfo(event) {
        console.log('Event happened now');
        console.log('**********************');
        console.log(event.target.dataset.contactid);
        const conid = event.target.dataset.contactid;
        console.log(conid);
        console.log('********************');
        let mapofCons = {};
        let contactInfo = this.contactData;
        for (let i = 0; i < contactInfo.length; i++) {
            mapofCons[contactInfo[i].Id] = contactInfo[i];
        }
        this.customerInfo = mapofCons[String(conid)];
        if (this.customerInfo) {
            this.showinfo = true;
            console.log(this.customerInfo);
        } else {
            this.showinfo = false;
            console.log('Not fetched !');
        }
        console.log('Completed-----');
        this.searchQuery = '';
        this.hascontacts = false;
    }
}