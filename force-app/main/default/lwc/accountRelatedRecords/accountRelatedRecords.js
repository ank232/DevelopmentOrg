import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import AllCustomers from '@salesforce/apex/CustomerDetailsController.AllCustomers'; // method to fetch all related contacts
export default class AccountRelatedRecords extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    recordId;
    /*
    ========>>>>>>>>   Properties <<<<<<<<========
     */
    // @api recordId;
    searchResults = []; //To show Contactlists
    searchQuery; // UserInput
    hascontacts; // bool
    contactData; // to store related contacts 
    selectedcontactId; // contact that user selected.
    CustomerInfoMap = {}; // contact data map
    showDetails = {}; // to render the selected contactDetail
    showSpinner = false; //spinner value
    malingstreet;
    mailingcountry;
    mailingcity;
    nocontactFound;
    // Connected Callback -> invoking allContacts apex method to fetch all related contacts by providing accountId
    connectedCallback() {
        // Inside a method or connectedCallback
        this.recordId = this.pageRef && this.pageRef.state && this.pageRef.state.recordId;

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
            const fireEvent = new CustomEvent('customernotselected', {
                detail: {
                    customerId: null,
                    customerdetail: null
                }
            });
            this.dispatchEvent(fireEvent);
            return;
        } else {
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
                this.searchResults.push({ ...con, isLoading: false });
            }
        }
        if (this.searchResults.length == 0) {
            console.log('No contact found with' + searchterm);
            this.nocontactFound = true;
            this.showDetails = null;
            this.selectedcontactId = null;
            console.log(this.selectedcontactId);
            const fireEvent = new CustomEvent('customernotselected', {
                detail: {
                    customerId: null,
                    customerdetail: null
                }
            });
            this.dispatchEvent(fireEvent);
            return;
        }
        else {
            console.log('Total Cons found-> ' + this.searchResults.length);
            this.nocontactFound = false;
        }
    }

    /*
    Destructuring CustomerInfomap to generate address to rnder on UI
     */
    MakeAddress({ MailingStreet, MailingState, MailingCountry, MailingCity }) {
        this.malingstreet = MailingStreet;
        this.mailingcountry = MailingCountry;
        this.mailingcity = MailingCity;
        return MailingStreet + ',' +
            MailingCity + ',' + MailingState + ',' + MailingCountry;
    }
    get streetName() {
        return this.malingstreet;
    }
    get city() {
        return this.mailingcity;
    }
    get country() {
        return this.mailingcountry;
    }
    /*
    This event handler will give me the selected contactId and will dispatch an event containing contactDetails 
    */
    handleCustomerinfo(event) {
        const conid = event.target.dataset.contactid;
        console.log(conid);
        this.selectedcontactId = conid;
        console.log(this.CustomerInfoMap[conid]);
        const address = this.MakeAddress(this.CustomerInfoMap[conid]);
        if (this.CustomerInfoMap[conid]) {
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
            this.searchQuery=this.CustomerInfoMap[conid].Name;
            this.searchResults = null;
        } else {
            this.showDetails = {};
        }
    }
}