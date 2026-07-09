import { CompactLayout } from "@/components/design-layouts/compact";
import { compactTheme } from "@/lib/design-themes";

export default function CompactDesignPage() {
  return (
    <div style={compactTheme}>
      <CompactLayout title="Teams Alert Inbox" subtitle="Dense table rows — max info, min chrome" />
    </div>
  );
}
