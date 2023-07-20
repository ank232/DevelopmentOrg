public class OpportunityHandler {
    public static void populatehighestOpp(Map<id, Opportunity> newOpps, Map<id, Opportunity> oldOpMap){
        Map<Id, List<Opportunity>> OpportunityMap = New map<Id, List<Opportunity>>();// related opp map
        for(Opportunity op: newOpps.values())
        {
            if(! OpportunityMap.containsKey(op.AccountId))
            {
                OpportunityMap.put(op.AccountId, New List<Opportunity>());
            }
            OpportunityMap.get(op.AccountId).add(op);
        }

        Map<Id,Decimal> OppAccIdmaxAmnt = New Map<Id, Decimal>(); // acId -highest amnt map

        List<AggregateResult> res = [
            SELECT
            AccountId ,
            MAX(Amount) 
            FROM Opportunity 
            WHERE
            Id In: newOpps.keySet()
            GROUP BY 
            AccountId 
        ];

        for(AggregateResult maxAmountAgr : res)
        {
            Id acountId = (Id) maxAmountAgr.get('AccountId');
            Decimal maxAmount  = (Decimal) maxAmountAgr.get('expr0');
            OppAccIdmaxAmnt.put(acountId, maxAmount);
        }

        List<Account> accounts=[SELECT ID, DESCRIPTION FROM ACCOUNT WHERE ID iN: OppAccIdmaxAmnt.keySet()];// accounts to update
        
        for(Account ac: accounts)
        {
            System.debug('This account-> '+ac.Name);
            System.debug('Opportunity having Highest amount->');

        }
    }
}