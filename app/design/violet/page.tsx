import { GroupedLayout } from "@/components/design-layouts/grouped";
import { violetTheme } from "@/lib/design-themes";

export default function VioletDesignPage() {
  return (
    <div style={violetTheme}>
      <GroupedLayout title="Teams Alert Inbox" subtitle="Tabs + grouped sections + search" />
    </div>
  );
}
