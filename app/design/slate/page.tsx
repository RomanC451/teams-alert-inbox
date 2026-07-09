import { TimelineLayout } from "@/components/design-layouts/timeline";
import { slateTheme } from "@/lib/design-themes";

export default function SlateDesignPage() {
  return (
    <div style={slateTheme}>
      <TimelineLayout title="Teams Alert Inbox" subtitle="Email inbox + vertical timeline thread" />
    </div>
  );
}
