import { CardsLayout } from "@/components/design-layouts/cards";
import { spaciousTheme } from "@/lib/design-themes";

export default function SpaciousDesignPage() {
  return (
    <div style={spaciousTheme}>
      <CardsLayout title="Teams Alert Inbox" subtitle="Card grid — centered, magazine-style" />
    </div>
  );
}
