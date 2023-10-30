public class LearningApex {
  public static void updateOpportunity() {
    List<Opportunity> getOpps = new List<Opportunity>(
      [
        SELECT ID, StageName, Description
        FROM Opportunity
        WHERE CreatedDate = LAST_WEEK
      ]
    );
    if (!getOpps.isEmpty()) {
      for (Opportunity opRec : getOpps) {
        if (opRec.StageName == 'Closed Won') {
          opRec.Description = 'Stage is Updated to' + opRec.StageName;
        } else if (opRec.StageName == 'Closed Lost') {
          opRec.Description = 'Opportunity is Closed won';
        }
      }
    }
    if (!getOpps.isEmpty()) {
      system.debug('Size is->' + getOpps.size());
      update getOpps;
    }
  }
}
