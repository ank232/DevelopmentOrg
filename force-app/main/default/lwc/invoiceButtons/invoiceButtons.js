import { LightningElement, wire, api } from 'lwc';
import { MessageContext, subscribe } from 'lightning/messageService';
import { createRecord } from 'lightning/uiRecordApi';
import InvoiceTotalMC from '@salesforce/messageChannel/InvoiceTotalMC__c';
import PaymentModal from 'c/paymentModal';
import RefundModal from 'c/refundModal';
import PreviewInvoice from 'c/previewInvoice';
import ExchangeRateModal from 'c/exchangeRateModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
export default class InvoiceButtons extends LightningElement {
    @api recordId;
    trueVal;
    paymentRec;
    refundRec;
    totalLinePrice;
    paidAmount;
    @api invoicedata;
    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Payments__r',
        fields: ['Payment__c.Id',
            'Payment__c.Name',
            'Payment__c.Reference_Number__c',
            'Payment__c.Amount__c', 'Payment__c.Status__c', 'Payment__c.Comments__c', 'Payment__c.Date__c'
        ]
    })
    PaymentRecords({ data, error }) {
        const refButton = this.template.querySelector(".refundButton");
        if (data) {
            if (!data.count) {
                refButton.classList.add("slds-hide");
                // this.paidAmount = 0;
            } else {
                // let amnt = 0;
                // data.records.map((item) => {
                //     amnt += item.fields.Amount__c.value;
                // });
                // this.paidAmount = amnt;
            }
        }
        if (error) {
            console.log('getRelatedListRecords has some Problem(s)!');
        }
    }
    connectedCallback() {
        console.log('Connected Callback Ran(InvoiceButtons LWC)');
        this.LineItemReciever();
    }

    @wire(MessageContext) messageContext;

    showNoficiation(title, message, variant) {
        const showToast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(showToast);
    }

    /* Recieving the LMS for LineItems */
    LineItemReciever() {
        subscribe(this.messageContext, InvoiceTotalMC, (message) => {
            this.InvoiceButtonVisibility(message);
        });
    }

    /* Defining the Payment Button Visibility 
    Condition: if Invoice is Approved and has LineItems ?
     */
    InvoiceButtonVisibility = (data) => {
        const button = this.template.querySelector(".paymentButton");
        if (data.invoicelines.length == 0) {
            button.classList.add('slds-hide');
        } else {
            const fireOrigin = data.fireOrigin;
            if (fireOrigin.includes("Related")) {                
                this.invoicedata = data;
                const maxAmnt = data.invoicelines.reduce((total, lineitem) => total + lineitem.totalAmount, 0.0);
                const totalTax = data.invoicelines.reduce((taxtotal, lineitem) => taxtotal + lineitem.taxAmount, 0.0);
                this.totalLinePrice = maxAmnt + totalTax;
            }
        }
    }

    ProcessPayment = (paymentData) => {
        const AmounttoPaid = paymentData["Amount__c"];
        
        // if (AmounttoPaid > this.totalLinePrice || AmounttoPaid > this.totalLinePrice - this.paidAmount) {
        //     this.showNoficiation("Warning", "Payment must be greater than the total LineItem", "Warning");
        //     return;
        // }        
        // if (AmounttoPaid > this.totalLinePrice || AmounttoPaid > this.totalLinePrice - this.paidAmount) {
        //     this.showNoficiation("Warning", "Payment must be greater than the total LineItem", "Warning");
        //     return;
        // }
        this.createpaymentRecord(paymentData);
    }

    createpaymentRecord(paymentrec) {
        paymentrec.Invoice__c = this.recordId;
        paymentrec.Name = "";
        const recordInput = {
            apiName: 'Payment__c',
            fields: paymentrec
        };
        createRecord(recordInput).then((result) => {
            console.log(result);
            window.location.reload();
        }).catch((error) => {
            this.showNoficiation("Error", error.body.output.errors[0].message, "Error");
            console.log(error);
        });
    }

    async RecordPayment() {
        this.trueVal = true;
        await PaymentModal.open({
            size: 'Small'
        }).then((result) => {
            if (result.paymentData) {
                this.paymentRec = result.paymentData;
                this.ProcessPayment(this.paymentRec);
            }
        }).catch((error) => {
            console.log('Error in Modal!!');
        });
    }

    async RecordRefund() {
        await RefundModal.open({
            size: 'Small'
        }).then((result) => {
            console.log('Recieved refund!');
            if (result.refundData) {
                this.refundRec = result.refundData;
                this.ProcessRefund(this.refundRec);
            }
        }).catch((error) => {
            console.log("Error in RefundModal")
            console.log(error);
        });
    }

    ProcessRefund(refundData) {
        console.log('I will create the refund!');
        console.log(refundData);
        console.log(refundData);
        // if (refundData.Amount__c > this.paidAmount) {
        //     this.showNoficiation("Warning", "Refunded amount should not exceed the paid Amount");
        //     return;
        // } else {
        console.log(refundData);        
        // if (refundData.Amount__c > this.paidAmount) {
        //     this.showNoficiation("Warning", "Refunded amount should not exceed the paid Amount");
        //     return;
        // } else {
        this.createRefundRecord(refundData);
    }

    createRefundRecord(refundrec) {
        refundrec.Invoice__c = this.recordId;
        const recordInput = {
            apiName: 'Refund__c',
            fields: refundrec
        };
        createRecord(recordInput).then((result) => {
            this.showNoficiation("Success", "Refund recorded Successfully", "Success");
            console.log("*** ", result);
            window.location.reload();
        }).catch((error) => {
            console.log(error);
            this.showNoficiation("Error", error.body.output.errors[0].message, "Error");
        });
    }
    
    async fetchExchangeRates() {
        await ExchangeRateModal.open({
            size: "small"
        }).then((result) => {
            if (result.data) {
                console.log('Result arrived');
                console.log(JSON.stringify(result));
                this.showNoficiation('Message', "Current Exchange Rates are", "Message");
            }
        }).catch((error) => {
            this.showNoficiation("Message", "Problem in Modal!", "Message");
            console.error(error);
        });
    }

    async previewInvoice() {
        console.log('Opening Modal');
        console.log('DATA: ');
        console.log(this.invoicedata);
        await PreviewInvoice.open({
            size: "large",
            decsciption: "invoice info",
            message: this.invoicedata
        }).catch((error) => {
            console.log(error);
            this.showNoficiation("Message", "modal closed", "Mesage");
        });
    }
} 