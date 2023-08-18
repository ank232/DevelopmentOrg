public class OpportunityHandler {
    public static void populatehighestOpp(Map<id, Opportunity> newOpps, Map<id, Opportunity> oldOpMap){
        Map<Id,Decimal> OppAccIdmaxAmnt = New Map<Id, Decimal>(); // acId -highest amnt map
system.debug(newOpps.size());
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
            System.debug(maxAmountAgr);
            Id acountId = (Id) maxAmountAgr.get('AccountId');
            Decimal maxAmount  = (Decimal) maxAmountAgr.get('expr0');
            OppAccIdmaxAmnt.put(acountId, maxAmount);
        }

        List<Account> accounts=[SELECT ID, Name,DESCRIPTION FROM ACCOUNT where Id IN: OppAccIdmaxAmnt.keyset() ];// accounts to update
        
        for(Account ac: accounts)
        {
                for(Opportunity o: newOpps.values())
                {
                    if(OppAccIdmaxAmnt.get(ac.Id)== o.Amount)
                    {
                        System.debug('Amount Matched');
                        System.debug(o.Name);
                        String maxOppname = o.Name + ' --- ' + OppAccIdmaxAmnt.get(ac.Id);
                        ac.Description = maxOppname;
                    }
                }
        }
        Update accounts;
    }
}