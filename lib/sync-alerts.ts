import { fetchTeamsAlerts } from "./gmail-imap";
import { upsertMessages } from "./messages";

export async function syncAlertsFromImap(limit = 50): Promise<number> {
  const alerts = await fetchTeamsAlerts(limit);
  return upsertMessages(alerts);
}
