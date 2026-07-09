export type DesignConcept = {
  href: string;
  title: string;
  vibe: string;
  accent: string;
  emoji: string;
};

export const refinedConcepts: DesignConcept[] = [
  {
    href: "/design/ios",
    title: "iMessage",
    vibe: "iOS dark messages — bubble chat, native feel",
    accent: "#0a84ff",
    emoji: "💬",
  },
  {
    href: "/design/slack",
    title: "Slack",
    vibe: "Channel rail + threaded feed, no page switch",
    accent: "#4a154b",
    emoji: "#",
  },
  {
    href: "/design/telegram",
    title: "Telegram",
    vibe: "Blue header, wallpaper chat, green outgoing",
    accent: "#2aabee",
    emoji: "✈",
  },
  {
    href: "/design/linear",
    title: "Linear",
    vibe: "Issue inbox sidebar + detail comments",
    accent: "#5e6ad2",
    emoji: "◆",
  },
  {
    href: "/design/gmail",
    title: "Gmail",
    vibe: "Mail list with stars, sidebar, reader view",
    accent: "#1a73e8",
    emoji: "✉",
  },
];

export const wildConcepts: DesignConcept[] = [
  {
    href: "/design/vaporwave",
    title: "Vaporwave Cathedral",
    vibe: "Pink sunsets, chrome grids, sacred alert energy",
    accent: "#ff00ff",
    emoji: "🌴",
  },
  {
    href: "/design/brutalist",
    title: "Brutalist Rage",
    vibe: "Raw HTML violence. Borders that scream.",
    accent: "#ff0000",
    emoji: "⬛",
  },
  {
    href: "/design/terminal",
    title: "Terminal Fever",
    vibe: "Green phosphor. Alerts as shell commands.",
    accent: "#33ff33",
    emoji: "▮",
  },
  {
    href: "/design/blob",
    title: "Bioluminescent Blob",
    vibe: "Living goo UI. Everything wobbles.",
    accent: "#00ffc8",
    emoji: "◉",
  },
  {
    href: "/design/windows95",
    title: "Windows 95 Incident",
    vibe: "Clippy helps with your outage.",
    accent: "#000080",
    emoji: "🪟",
  },
];

export const designConcepts = [...refinedConcepts, ...wildConcepts];
