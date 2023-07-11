import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import INVOICE_NO_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Invoice__c'
import PRODUCT_NAME_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Product__c';
import QUANTITY_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Quantity__c';
import TAX_aMOUNT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Amount__c';
import TAX_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax__c';
import TAX_TYPE_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Tax_Type__c';
import UNIT_AMOUNT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Unit_Amount__c';
import TOTAL_AMOUNT_FIELD from '@salesforce/schema/Invoice_Line_Items__c.Total_Amount__c';
export default class CreateInvoiceLineItem extends LightningElement {
    CalclulatedTax = 0;
    CalculatedTotalAmount = 0;
    fields = [
        INVOICE_NO_FIELD,
        PRODUCT_NAME_FIELD,
        UNIT_AMOUNT_FIELD,
        QUANTITY_FIELD,
        TAX_TYPE_FIELD,
        TAX_FIELD
    ];
    CalcuateTotalAmnt(quanity, unitamnt) {
        const totalAmnt = quanity * unitamnt;
        this.CalculatedTotalAmount = totalAmnt;
    }
    CalculateTaxAmount(quantity, unitAmnt, tax) {
        const TaxedAmnt = (unitAmnt * (tax / 100)) * quantity;
        this.CalclulatedTax = TaxedAmnt;
    }
    handleInvoiceLineInput(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        console.log('_+_+_+_+_+_++');
        console.log(fields);
        this.CalculateTaxAmount(fields.Quantity__c, fields.Unit_Amount__c, fields.Tax__c);
        this.CalcuateTotalAmnt(fields.Quantity__c, fields.Unit_Amount__c);
    }
}