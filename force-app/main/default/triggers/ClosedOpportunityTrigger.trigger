trigger ClosedOpportunityTrigger on Opportunity (after insert, after update) {
if(Trigger.isAfter)
{
    if(Trigger.IsInsert)
    {
        
    }
}
}