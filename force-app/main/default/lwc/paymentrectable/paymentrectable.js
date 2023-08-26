import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
export default class Paymentrectable extends LightningElement {
    @api recordId;
    loadingScreen;
    paymentrecs;
    totalPaidAmount;
    showNoficiation(title, message, variant) {
        const showToast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(showToast);
    }
    CalculatePaidAmount(data) {
        const paidAmount = data.reduce((item, paymentrec) => item + paymentrec.Amount__c, 0.0);
        return paidAmount;
    }
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Payments__r',
        fields: ['Payment__c.Id',
            'Payment__c.Name',
            'Payment__c.Reference_Number__c',
            'Payment__c.Amount__c', 'Payment__c.Status__c', 'Payment__c.Comments__c', 'Payment__c.Date__c'
        ]
    })
    wiredPaymentRecords({ data, error }) {
        if (data) {
            const temprecs = [];
            const fieldVals = data.records;
            fieldVals.forEach(obj => {
                let record = {};
                record.Id = obj.fields.Id.value;
                record.Reference = obj.fields.Reference_Number__c.value;
                record.Date = obj.fields.Date__c.value;
                record.Status__c = obj.fields.Status__c.value;
                record.Amount__c = obj.fields.Amount__c.value;
                record.Name = obj.fields.Name.value;
                record.Comments = obj.fields.Comments__c.value;
                temprecs.push(record);
            });
            this.paymentrecs = temprecs;
            this.totalPaidAmount = this.CalculatePaidAmount(this.paymentrecs);
        }
        if (error) {
            console.log("Error at relatedRecs!!");
            console.log(error);
            this.paymentrecs = null;
        }
    }
    deletePaymentRecord = (event) => {
        const rowIndex = event.target.dataset.id;
        const recTodelete = this.paymentrecs[rowIndex];
        this.deletePayment(recTodelete.Id, rowIndex);
    }
    deletePayment(paymentId, rowid) {
        deleteRecord(paymentId).then(() => {
            setTimeout(() => {
                this.loadingScreen = true;
                this.paymentrecs.splice(rowid, 1);
                this.paymentrecs = [...this.paymentrecs];
            }, 300);
            this.loadingScreen = false;
            this.showNoficiation("Message", "Payment has been deleted", "Message");
        }).catch((error) => {
            this.showNoficiation("Error", error.message, "Error");
        });
    }
}