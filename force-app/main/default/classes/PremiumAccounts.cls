public with sharing class PremiumAccounts {
  public PremiumAccounts() {
    List<Account> accs;
  }

  public static List<Account> getPremiumAccounts() {
    Map<ID, list<Contact>> accountconMap = new Map<id, list<Contact>>();
    List<Account> accs = [
      SELECT id, name, industry, (SELECT id, firstname, lastname FROM contacts)
      FROM account
      LIMIT 20
    ];
    for (Account ac : accs) {
      accountconMap.put(ac.Id, ac.contacts);
    }
    return accs;
  }

  public static List<Account> PostAccounts() {
    List<Account> accountsForPost = new List<Account>(
      [SELECT name, INDUSTRY FROM ACCOUNT LIMIT 5]
    );
    return accountsForPost;
  }
}
