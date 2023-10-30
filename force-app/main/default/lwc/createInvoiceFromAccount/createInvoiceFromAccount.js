import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import AccountRelatedRecords from "c/accountRelatedRecords";
import GetInvoiceDetails from "@salesforce/apex/CreateInvoice.GetInvoiceDetails";
export default class CreateInvoiceFromAccount extends LightningElement {
  @api recordId;
  @api isinvoicecreated = false;
  @api invoicerecid;
  customerId;
  customerInformation;
  isContactSelected = false;
  showSpinner = false;
  /*
    Getting values from child component (search contact)
     */
  handlechildEvent(event) {
    console.log(event.detail);
    console.log("I called from child!");
    const { customerId, customerdetail } = event.detail;
    console.log("Selected Customer ID:", customerId);
    console.log("Selected Customer Details:", customerdetail);
    this.customerId = customerId;
    this.isContactSelected = true;
  }
  handleNotSelected(event) {
    const detail = event.detail;
    // this.showNoficiation('Waring', 'Contact not found or not selected ', 'Warning');
    this.isContactSelected = false;
  }
  /*
     Method to Validate Date: Date should be in proper timeline 
     */
  validateDates(duedate, invoicedate) {
    const dateFields = [duedate, invoicedate];
    if (dateFields.some((field) => field === null)) {
      this.showNoficiation(
        "Error",
        "Date Fields cannot be left blank",
        "error"
      );
      return false;
    } else {
      let dueDate = new Date(duedate);
      let invoiceDate = new Date(invoicedate);
      if (dueDate < invoiceDate) {
        this.showNoficiation(
          "Error",
          "Due date must be one day after invoiceDate",
          "error"
        );
        return false;
      } else {
        // this.showNoficiation('Success', 'All good!', 'success');
        return true;
      }
    }
  }
  showNoficiation(title, message, variant) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(showToast);
  }

  CreateInvoiceRecord(userInput) {
    console.log("*** Creating record here");
    const {
      Due_Date__c,
      Invoice_Date__c,
      Invoice_Number__c,
      Customer__c,
      Company__c,
      From_Address__c,
      Reference__c,
      Comments__c,
      CurrencyIsoCode
    } = userInput;
    GetInvoiceDetails({
      companyId: Company__c,
      customerId: Customer__c,
      invoicedate: Invoice_Date__c,
      duedate: Due_Date__c,
      fromAddress: From_Address__c,
      comment: Comments__c,
      invoiceno: Invoice_Number__c,
      referenceno: Reference__c,
      currencyCode: CurrencyIsoCode
    })
      .then((result) => {
        console.log("Created ");
        console.log(result);
        const invNo = result[1];
        console.log("|||||||=-=-=-= ", invNo);
        this.showNoficiation(
          "Message",
          invNo + " Has been created.",
          "Message"
        );
        this.invoicerecid = result[0];
      })
      .catch((error) => {
        console.log("Uh oh!!");
        console.log(error);
        this.invoicerecid = null;
      });
  }

  ResetForm() {
    const formfieldTorest = this.template.querySelectorAll(
      "lightning-input-field"
    );
    formfieldTorest.forEach((formfield) => {
      formfield.reset();
    });
  }
  /* 
    Generate invoice =====>>> event-> onclick() 
    */
  GenerateInvoice(event) {
    event.preventDefault();
    console.log("**** Event happened");
    const userinput = event.detail.fields;
    const { Due_Date__c: dueDate, Invoice_Date__c: invoiceDate } =
      event.detail.fields;
    const valid = this.validateDates(dueDate, invoiceDate);
    if (!this.isContactSelected) {
      this.showNoficiation("Warning", "Please Select a Contact", "Error");
      return;
    }
    if (valid && this.isContactSelected) {
      console.log("Can proceed further");
      userinput.Customer__c = this.customerId;
      event.target.fields = userinput;
      console.log("**************************************");
      console.log(userinput);
      // event.target.submit();
      this.showSpinner = true;
      // setTimeout(() => {
      this.CreateInvoiceRecord(userinput);
      this.showSpinner = false;
      // }, 300);
      console.log("Submitting user values....");
      this.showNoficiation("Success", "Invoice has been Generated", "Success");
      this.isinvoicecreated = true;
    } else {
      console.log("Cannot proceed further");
      this.isinvoicecreated = false;
      this.invoicerecid = null;
    }
  }
  handleError(event) {
    console.log("Cannot done!!");
    console.log(event);
    const errorMessage = event.detail;
    this.showNoficiation("Error", errorMessage, "Error");
  }
}
