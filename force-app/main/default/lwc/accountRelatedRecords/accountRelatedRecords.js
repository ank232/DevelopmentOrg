import { LightningElement, api } from 'lwc';
import AllCustomers from '@salesforce/apex/CustomerDetailsController.AllCustomers'; // method to fetch all related contacts
const DELAY = 560;
export default class AccountRelatedRecords extends LightningElement {
    /*
    ========>>>>>>>>   Properties <<<<<<<<========
     */
    @api recordId;
    searchResults = []; //To show Contactlists
    searchQuery;
    hascontacts; // bool
    contactData; // to store related contacts 
    selectedcontactId; // contact that user selected.
    CustomerInfoMap = {};
    showDetails = {};
    showSpinner = false; //spinner value
    customerAddress;
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
                for (let i = 0; i < this.contactData.length; i++) {
                    console.log(this.contactData[i]);
                    this.CustomerInfoMap[this.contactData[i].Id] = this.contactData[i];
                }
            }
        }).catch(error => {
            console.log(error);
        });
    }
    customername(event) {
        // console.log('-------------');
        this.searchQuery = event.target.value;
        // Adding another condition: 
        if (!this.searchQuery) {
            this.searchResults = [];
            this.showDetails = {};
            return;
        }
        if (this.hascontacts && this.searchQuery) {
            const searchInput = this.searchQuery.toLowerCase();
            this.searchResults = [];
            this.showSpinner = true;
            setTimeout(() => {
                for (const contactId in this.CustomerInfoMap) {
                    const con = this.CustomerInfoMap[contactId];
                    const conName = con.Name.toLowerCase();
                    if (conName.includes(searchInput)) {
                        console.log('-----');
                        console.log(con);
                        console.log('-----');
                        this.searchResults.push({...con, isLoading: false });
                    }
                }
                this.showSpinner = false;
            }, DELAY);
        } else if (!this.hascontacts || !this.searchQuery) {
            console.log('Account has no contact, hence search result should be empty');
            this.searchResults = [];
            this.showDetails = {};
        }
    }
    MakeAddress({ MailingStreet, MailingState, MailingCountry, MailingCity }) {
            return MailingStreet + ',' +
                MailingCity + ',' + MailingState + ',' + MailingCountry;
        }
        //This event handler will give me the selected contactId
    handleCustomerinfo(event) {
        const conid = event.target.dataset.contactid;
        this.selectedcontactId = conid;
        console.log('Selected ConId(From Parent)');
        console.log(this.selectedcontactId);
        console.log('Con Details(From Parent)');
        console.log(this.CustomerInfoMap);
        if (conid && this.CustomerInfoMap && this.CustomerInfoMap[conid]) { //=> original = if (this.CustomerInfoMap) 
            console.log("Map is not empty");
            console.log(this.CustomerInfoMap[conid]);
            this.showDetails = this.CustomerInfoMap[conid];
            this.customerAddress = this.MakeAddress(this.showDetails);
            // this.customerAddress = this.showDetails.MailingStreed + this.showDetails.M;
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
            const customEvent = new CustomEvent('customerselected', {
                detail: {
                    customerId: '',
                    customerdetail: null
                }
            });
            this.dispatchEvent(customEvent);
        }
    }
}