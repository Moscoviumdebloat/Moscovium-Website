import { Github, Twitter, MessageSquare, type LucideIcon } from "lucide-react";

type SocialLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type SiteConfig = {
  socialLinks: SocialLink[];
  downloadLink: string;
  // The short address `irm` fetches the CLI bundle from. The `https://` is not
  // optional: Windows PowerShell assumes http:// and does not follow the 308
  // the host answers with, so the scheme has to be part of the shown command.
  cliInstallUrl: string;
  donationLink: string;
  // To add a background image or GIF, simply provide its URL here.
  // For example: "https://example.com/my-background.gif"
  // To remove the background, set it to an empty string "".
  backgroundUrl: string;
};

export const siteConfig: SiteConfig = {
  socialLinks: [
    {
      name: "Discord",
      href: "https://discord.gg/RTdYYVenKD",
      icon: Twitter,
    },
    {
      name: "GitHub",
      href: "https://github.com/Moscoviumdebloat",
      icon: Github,
    },
    {
      name: "Shit",
      href: "https://yabosen.live/",
      icon: MessageSquare,
    },
  ],
  downloadLink: "https://github.com/Moscoviumdebloat/Moscovium/releases/latest",
  cliInstallUrl: "https://cli.moscovium.xyz",
  donationLink: "https://www.tipeeestream.com/yabosen/donation",
  backgroundUrl: "/Illustration.gif",
};
