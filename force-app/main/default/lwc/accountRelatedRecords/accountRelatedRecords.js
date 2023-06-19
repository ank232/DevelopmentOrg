import { LightningElement, api } from 'lwc';
import AllCustomers from '@salesforce/apex/CustomerDetailsController.AllCustomers'; // method to fetch all related contacts
const DELAY = 300;
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
    // Connected Callback -> invoking allContacts apex method to fetch all related contacts by providing accountId
    connectedCallback() {
        AllCustomers({
            CompanyId: this.recordId
        }).then(result => {
            if (result.length == 0) {
                this.hascontacts = false;
                this.contactData = null; // since, its empty, no data!
            } else {
                console.log('Account as contact(s)');
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
            console.log('-------------');
            this.searchQuery = event.target.value;
            if (this.hascontacts && this.searchQuery) {
                const searchInput = this.searchQuery.toLowerCase();
                this.searchResults = [];
                this.showSpinner = true;
                setTimeout(() => {
                    for (const contactId in this.CustomerInfoMap) {
                        const con = this.CustomerInfoMap[contactId];
                        const conName = con.Name.toLowerCase();
                        if (conName.includes(searchInput)) {
                            // this.searchResults.push(con);
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
        //This event handler will give me the selected contactId
    handleCustomerinfo(event) {
        const conid = event.target.dataset.contactid;
        this.selectedcontactId = conid;
        if (this.CustomerInfoMap) {
            console.log("Map is not empty");
            console.log(this.CustomerInfoMap[conid]);
            this.showDetails = this.CustomerInfoMap[conid];
            const customEvent = new CustomEvent('customerselected', {
                detail: {
                    customerId: conid,
                    customerdetail: this.CustomerInfoMap[conid]
                }
            });
            this.dispatchEvent(customEvent);

        } else {
            console.log('map is empty');
            this.showDetails = {};
        }
    }
}