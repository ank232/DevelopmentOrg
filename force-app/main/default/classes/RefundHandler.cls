public with sharing class RefundHandler {
    public static void checkrefundDate(List<Refund__c> verifyRefunds)
    {
        Set<Id> invoiceIds = new Set<Id>();
        for(Refund__c ref: verifyRefunds)
        {
            invoiceIds.add(ref.Invoice__c);
        }
        Map<Id, Invoice__c> invoiceMap = new Map<Id, Invoice__c>([
            SELECT 
            ID,
            Paid_date__c,
            (
                SELECT
                ID,
                Status__c,
                Amount__c,
                Date__c 
                FROM 
                Payments__r
            ) ,
            (
                SELECT
                ID ,
                Date__c,
                Amount__c,
                LastModifiedDate
                FROM 
                Refunds__r
                ORDER BY
                LastModifiedDate
                DESC
            )
            FROM 
            Invoice__c 
            WHERE 
            ID IN: invoiceIds
        ]);
        if(!invoiceMap.isEmpty())
        {
            for(Refund__c refund: verifyRefunds)
            {
                validateRefund(refund,invoiceMap.get(refund.Invoice__c));
            }
        }                   
    }

    private static void validateRefund(Refund__c refundRec, Invoice__c invoiceRec)
    {
        // checking if the has any payment or not
        if(invoiceRec.payments__r.isEmpty())
        {
            refundRec.addError('Refund should have atleast one payment');
        }
        // checking ig user gave amnt greater than the payments amnt
        if(refundRec.Amount__c > PaymentHandler.calculateTotalAmnt(invoiceRec.payments__r ))
        {
            refundRec.addError('Refund cannot be greater than paid amount');
        }
        // if refunds been made already
        if(!invoiceRec.Refunds__r.isEmpty())
        {
            // checking if the user given amnt + the existing ref amnt doesn't exceed the payments amnt
            if(calculateRefundAmount(invoiceRec.Refunds__r) + refundRec.Amount__c > PaymentHandler.calculateTotalAmnt(invoiceRec.payments__r))
            {
                refundRec.addError('Refund amount exceeded');
                return;
            }
            else{
                system.debug('Latest Refund was made on: ');
                System.debug(invoiceRec.Refunds__r[0].Date__c);
                if(invoiceRec.Paid_date__c>invoiceRec.Refunds__r[0].Date__c)
                {
                    refundRec.addError('Refund Date should atleast one day after payment has been recorded');
                }
            }
        }
    }

/*
This method will find the latest payment Made against the invoice and 
will compaere it to the paidDate On invoiceObj Record
*/ 
    private static Boolean setRefundDate(Date invoicePaidDate,List<Refund__c> refunds)
    {
        for(Refund__c ref: refunds)
        {
          
        }
        return false;
    }
    private static double calculateRefundAmount(List<Refund__c> refundData)
    {
        double amnt =0;
        for(refund__c ref: refundData)
        {
            amnt+= ref.Amount__c;
        }
        return amnt;
    }
}