import { LightningElement, api } from 'lwc';
import RelatedContacts from '@salesforce/apex/CustomerDetailsController.RelatedContacts'; // method to get contact details
import allContacts from '@salesforce/apex/CustomerDetailsController.allContacts'; // method to fetch all related contacts
import SearchBar from './Searchbar.css';
export default class AccountRelatedRecords extends LightningElement {
    /*
    ========>>>>>>>>   Properties <<<<<<<<========
     */
    @api recordId;
    searchResults = []; //To show Contactlists
    contactMap = {};
    searchQuery;
    hascontacts; // bool
    contactData; // to store related contacts 
    selectedcontactId; // contact that user selected.
    customerInfo; // to store data about contact(name, email, phone, etc)
    showinfo; //bool
    showSpinner = false; //bool

    // Connected Callback -> invoking allContacts apex method to fetch all related contacts by providing accountId
    connectedCallback() {
            allContacts({
                CompanyId: this.recordId
            }).then(result => {
                if (result.length == 0) {
                    console.log('This account has no contacts!');
                    this.hascontacts = false;
                    this.contactData = null; // since, its empty, no data!
                } else {
                    console.log('Account as contact(s)');
                    console.log(result);
                    this.contactData = result;
                    this.hascontacts = true; // why?
                }
            }).catch(error => {
                console.log(error);
            });
        }
        // event for user input -> it will check if its null or not
    customername(event) {
        console.log('-------------');
        console.log(this.contactData);
        if (!this.contactData) {
            console.log('contactData was found Null');
            return;
        } else {
            this.searchQuery = event.target.value;
            console.log('Input Value==');
            console.log('this.searchQuery ', this.searchQuery);
            if (!this.searchQuery) {
                console.log('its empty; it should not display the contacts');
                this.searchResults = [];
                this.customerInfo = null;
            } else {
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                this.showSpinner = true;
                if (this.searchQuery.length >= 3) {
                    this.searchTimeout = setTimeout(() => {
                        this.search();
                    }, 300);
                } else {
                    this.showSpinner = false;
                }
            }
        }
    }
    search() {
            RelatedContacts({
                CompanyId: this.recordId,
                searchterm: this.searchQuery
            }).then(result => {
                // Checking if the result contains contacts or not.
                if (result.length == 0) {
                    console.log('No Contact was found'); // That means we didn't get any data from controller
                    console.log(result);
                    this.hascontacts = false;
                    this.searchResults = [];
                    this.customerInfo = null;
                    this.showSpinner = false;
                } else {
                    // putting the result into searchResult and making hascontacts to true
                    console.log('Contacts Found');
                    this.hascontacts = true;
                    this.searchResults = result;
                    console.log('SearchResult--');
                    console.log(this.searchResults);
                }
            }).catch(error => {
                console.log('Error');
                console.log(error);
                this.hascontacts = false;
                this.searchResults = [];
                this.customerInfo = null;
            }).finally(() => {
                this.showSpinner = false;
            });
        }
        // This event handler will give me the selected contactId
    handleCustomerinfo(event) {
        // console.log('Event happened now');
        console.log('**********************');
        // console.log(event.target.dataset.contactid);
        const conid = event.target.dataset.contactid;
        // console.log(conid);
        console.log('********************');
        let mapofCons = {};
        console.log('----------------');
        console.log(this.contactData);
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
        const customEvent = new CustomEvent('customerselected', {
            detail: {
                customerId: conid,
                customerdetail: this.customerInfo
            }
        });
        this.dispatchEvent(customEvent);
    }
}