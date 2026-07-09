import { SplitLayout } from "@/components/design-layouts/split";
import { forestTheme } from "@/lib/design-themes";

export default function ForestDesignPage() {
  return (
    <div style={forestTheme}>
      <SplitLayout title="Teams Alert Inbox" subtitle="Split pane — threads left, chat right" />
    </div>
  );
}
