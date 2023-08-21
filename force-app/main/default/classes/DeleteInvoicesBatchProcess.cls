global class DeleteInvoicesBatchProcess implements Database.Batchable <SObject> {

    public Database.QueryLocator start(Database.BatchableContext BC)
        {
            Date OneyearAgo = Date.today().addYears(-1);
            return  Database.getQueryLocator(
                'SELECT ID FROM INVOICE__C WHERE createdDate =:OneyearAgo'
            );
        }
    public void execute(Database.BatchableContext BC, List<Invoice__c> oldInvoiceRecords)
    {
        System.debug('Batch Is running');
        Database.DeleteResult[] deleteinvoiceRes = Database.delete(oldInvoiceRecords, false);
        for(Database.DeleteResult result: deleteinvoiceRes)
        {
            if(!result.isSuccess())
            {
                for(Database.Error err: result.getErrors())
                {
                    System.debug('Delete Batch DML failed');
                    System.debug(err.getMessage());
                }
            }
        }
    }
    public void  finish(Database.BatchableContext BC)
    {

    }
}