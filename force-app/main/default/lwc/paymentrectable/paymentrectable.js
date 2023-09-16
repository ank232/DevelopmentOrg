import { LightningElement, api, wire } from "lwc";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { deleteRecord } from "lightning/uiRecordApi";
export default class Paymentrectable extends LightningElement {
  @api recordId;
  loadingScreen = false;
  paymentrecs;
  paymentsummary = {
    totalPaidAmount: "0.00",
    paymentCurrency: "USD"
  };
  showNoficiation(title, message, variant) {
    const showToast = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(showToast);
  }
  CalculatePaidAmount(data) {
    const paidAmount = data.reduce(
      (item, paymentrec) => item + paymentrec.PaidAmount,
      0.0
    );
    return paidAmount;
  }
  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Payments__r",
    fields: [
      "Payment__c.Id",
      "Payment__c.Name",
      "Payment__c.CurrencyIsoCode",
      "Payment__c.Reference_Number__c",
      "Payment__c.Amount__c",
      "Payment__c.Status__c",
      "Payment__c.Comments__c",
      "Payment__c.Date__c"
    ]
  })
  wiredPaymentRecords({ data, error }) {
    if (data) {
      if (data.records.length == 0) {
        this.paymentsummary = {
          totalPaidAmount: "0.000",
          paymentCurrency: "USD"
        };
      } else {
        console.log("total payment recs");
        console.log(data.records.length);
        console.log("==Inside payment wire method");
        const temprecs = [];
        const fieldVals = data.records;
        console.log(fieldVals);
        fieldVals.forEach(obj => {
          let record = {};
          record.Id = obj.fields.Id.value;
          record.Reference = obj.fields.Reference_Number__c.value;
          record.Date = obj.fields.Date__c.value;
          record.Status__c = obj.fields.Status__c.value;
          record.Amount__c = obj.fields.Amount__c.displayValue;
          record.Name = obj.fields.Name.value;
          record.PaidAmount = obj.fields.Amount__c.value;
          record.Comments = obj.fields.Comments__c.value;
          record.currencycode = obj.fields.CurrencyIsoCode.value;
          temprecs.push(record);
        });
        this.paymentrecs = temprecs;
        this.paymentsummary = {
          totalPaidAmount: this.CalculatePaidAmount(this.paymentrecs),
          paymentCurrency: this.paymentrecs[0]["currencycode"]
        };
      }
    } else if (error) {
      console.log("Error at relatedRecs!!");
      console.log(error);
      this.paymentrecs = null;
    }
  }
  deletePaymentRecord = event => {
    const rowIndex = event.target.dataset.id;
    const recTodelete = this.paymentrecs[rowIndex];
    setTimeout(() => {
      this.loadingScreen = true;
      this.deletePayment(recTodelete.Id, rowIndex);
    }, 300);
  };
  deletePayment(paymentId, rowid) {
    deleteRecord(paymentId)
      .then(() => {
        this.paymentrecs.splice(rowid, 1);
        this.paymentrecs = [...this.paymentrecs];
        this.showNoficiation("Message", "Payment has been deleted", "Message");
        this.loadingScreen = false;
      })
      .catch(error => {
        this.showNoficiation("Error", error.message, "Error");
      });
    if (this.paymentrecs.length == 0) {
      console.log("All records deleted");
    }
  }
}
