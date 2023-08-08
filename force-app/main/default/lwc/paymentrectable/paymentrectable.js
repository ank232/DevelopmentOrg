import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
export default class Paymentrectable extends LightningElement {
    @api recordId;
    paymentrecs;
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Payments__r',
        fields: ['Payment__c.Name', 'Payment__c.Reference_Number__c', 'Payment__c.Amount__c', 'Payment__c.Status__c', 'Payment__c.Comments__c', 'Payment__c.Date__c']
    })
    wiredPaymentRecords({ data, error }) {
        if (data) {
            const temprecs = [];
            const fieldVals = data.records;
            fieldVals.forEach(obj => {
                let record = {};
                record.Reference = obj.fields.Reference_Number__c.value;
                record.Date = obj.fields.Date__c.value;
                record.Status__c = obj.fields.Status__c.value;
                record.Amount__c = obj.fields.Amount__c.value;
                record.Name = obj.fields.Name.value;
                record.Comments = obj.fields.Comments__c.value;
                temprecs.push(record);
            });
            this.paymentrecs = temprecs;
            console.log('Below');
            console.log(JSON.stringify(this.paymentrecs));
        }
        if (error) {
            console.log("Error at relatedRecs!!");
            console.log(error);
            this.paymentrecs = null;
        }
    }
}