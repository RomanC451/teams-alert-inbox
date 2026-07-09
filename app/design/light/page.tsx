import { ClassicLayout } from "@/components/design-layouts/classic";
import { lightTheme } from "@/lib/design-themes";

export default function LightDesignPage() {
  return (
    <div style={lightTheme}>
      <ClassicLayout title="Teams Alert Inbox" subtitle="Classic list — same layout as production" />
    </div>
  );
}
