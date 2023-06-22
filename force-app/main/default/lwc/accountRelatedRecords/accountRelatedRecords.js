import { LightningElement, api } from 'lwc';
import AllCustomers from '@salesforce/apex/CustomerDetailsController.AllCustomers'; // method to fetch all related contacts
export default class AccountRelatedRecords extends LightningElement {
    /*
    ========>>>>>>>>   Properties <<<<<<<<========
     */
    @api recordId;
    searchResults = []; //To show Contactlists
    searchQuery; // UserInput
    hascontacts; // bool
    contactData; // to store related contacts 
    selectedcontactId; // contact that user selected.
    CustomerInfoMap = {}; // contact data map
    showDetails = {}; // to render the selected contactDetail
    showSpinner = false; //spinner value

    // Connected Callback -> invoking allContacts apex method to fetch all related contacts by providing accountId
    connectedCallback() {
        AllCustomers({
            CompanyId: this.recordId
        }).then(result => {
            if (result.length == 0) {
                this.hascontacts = false;
                this.contactData = null; // since, its empty, no data!
            } else {
                console.log('Account has contact(s)');
                this.contactData = result;
                this.hascontacts = true;
                console.log('Result Recieved');
                // Making a key value pair: key-> contactId ; value-> contactData
                for (let i = 0; i < this.contactData.length; i++) {
                    console.log(this.contactData[i]);
                    this.CustomerInfoMap[this.contactData[i].Id] = this.contactData[i];
                }
            }
        }).catch(error => {
            console.log(error);
        });
    }

    /*
    Purpose : to handle user Input
    event-> Onchange() 
    */
    customername(event) {
        this.searchQuery = event.target.value;
        clearTimeout(this.searchTimeout);
        // If searchQuery is empty; do nothing
        this.showSpinner = true;
        if (!this.searchQuery) {
            console.log('You searched nothing');
            this.searchResults = [];
            this.showDetails = {};
            this.showSpinner = false;
            return;
        }
        this.showSpinner = true;
        this.searchTimeout = setTimeout(() => {
            // If searchQuery is not empty and also the account has contacts; perform search operation
            if (this.hascontacts && this.searchQuery) {
                this.searchResults = [];
                this.searchContact(this.searchQuery);
                this.showSpinner = false;
            }
        }, 300);
    }

    /*
     method to search contact 
     @params: String searchTerm
     */
    searchContact(searchterm) {
        for (const contactId in this.CustomerInfoMap) {
            const con = this.CustomerInfoMap[contactId];
            const contactName = con.Name.toLowerCase();
            if (contactName.includes(searchterm)) {
                this.searchResults.push({...con, isLoading: false });
                console.log(this.searchResults);
            }
        }
    }

    /*
    Destructuring CustomerInfomap to generate address to rnder on UI
     */
    MakeAddress({ MailingStreet, MailingState, MailingCountry, MailingCity }) {
        return MailingStreet + ',' +
            MailingCity + ',' + MailingState + ',' + MailingCountry;
    }

    /*
    This event handler will give me the selected contactId and will dispatch an event containing contactDetails 
    */
    handleCustomerinfo(event) {
        const conid = event.target.dataset.contactid;
        this.selectedcontactId = conid;
        if (conid && this.CustomerInfoMap && this.CustomerInfoMap[conid]) { //=> original = if (this.CustomerInfoMap) 
            console.log("Map is not empty");
            console.log(this.CustomerInfoMap[conid]);
            const address = this.MakeAddress(this.CustomerInfoMap[conid]);
            this.showDetails = {
                ...this.CustomerInfoMap[conid],
                address: address
            };
            const customEvent = new CustomEvent('customerselected', {
                detail: {
                    customerId: conid,
                    customerdetail: this.CustomerInfoMap[conid]
                }
            });
            this.dispatchEvent(customEvent);

        } else {
            console.log('Selected contact ID is null or not found in the map');
            this.showDetails = {};
        }
    }
}