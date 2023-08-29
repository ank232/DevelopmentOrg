import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
export default class RefundRectable extends LightningElement {
    @api recordId;
    loadingScreen = false;
    refundrecs;
    totalRedundedAmount;
    showNoficiation(title, message, variant) {
        const showToast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(showToast);
    }
    CalculatePaidAmount(data) {
        const refundedAmnt = data.reduce((item, refundrec) => item + refundrec.Amount__c, 0.0);
        return refundedAmnt;
    }
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Refunds__r',
        fields: ['Refund__c.Id',
            'Refund__c.Name',
            'Refund__c.Reference_Number__c',
            'Refund__c.Amount__c', 'Refund__c.Status__c', 'Refund__c.Reason__c', 'Refund__c.Date__c'
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
                record.Comments = obj.fields.Reason__c.value;
                temprecs.push(record);
            });
            this.refundrecs = temprecs;
            this.totalRedundedAmount = this.CalculatePaidAmount(this.refundrecs);
        }
        if (error) {
            console.log("Error at relatedRecs!!");
            console.log(error);
            this.refundrecs = null;
        }
    }
    deleteRefundRecord = (event) => {
        const rowIndex = event.target.dataset.id;
        const recTodelete = this.refundrecs[rowIndex];
        setTimeout(() => {
            this.loadingScreen = true;
            this.deletePayment(recTodelete.Id, rowIndex);
        }, 300);
    }
    deletePayment(paymentId, rowid) {
        deleteRecord(paymentId).then(() => {
            this.refundrecs.splice(rowid, 1);
            this.parefundrecsymentrecs = [...this.paymentrecs];
            this.showNoficiation("Message", "Payment has been deleted", "Message");
            this.loadingScreen = false;
        }).catch((error) => {
            this.showNoficiation("Error", error.message, "Error");
        });
    }
}