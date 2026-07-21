import {
  SiTelegram,
  SiVk,
  SiInstagram,
  SiYoutube,
  SiOdnoklassniki,
  SiTiktok,
  SiFacebook,
  SiX,
  SiPinterest,
  SiSnapchat,
  SiReddit,
  SiDiscord,
  SiTwitch,
  SiSpotify,
  SiSoundcloud,
  SiWhatsapp,
  SiViber,
  SiSignal,
  SiThreads,
  SiTumblr,
  SiVimeo,
  SiDailymotion,
  SiYandex,
  SiGithub,
  SiGitlab,
  SiMedium,
  SiDribbble,
  SiBehance,
  SiApplepodcasts,
  SiKick,
  SiBluesky,
  SiMastodon,
  SiSteam,
} from "@icons-pack/react-simple-icons";
import { MessageCircle, Play, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>> | LucideIcon;

export type BrandIcon = {
  key: string;
  label: string;
  color: string;
  Icon: IconCmp;
};

// Curated set of popular platforms. Add more here — они автоматически
// появятся в выборе иконок в админ-панели.
export const ICON_LIBRARY: BrandIcon[] = [
  { key: "max", label: "Max", color: "#7B4FFF", Icon: MessageCircle },
  { key: "vk", label: "ВКонтакте", color: "#0077FF", Icon: SiVk },
  { key: "telegram", label: "Telegram", color: "#229ED9", Icon: SiTelegram },
  { key: "ok", label: "Одноклассники", color: "#EE8208", Icon: SiOdnoklassniki },
  { key: "instagram", label: "Instagram", color: "#E4405F", Icon: SiInstagram },
  { key: "rutube", label: "RuTube", color: "#000000", Icon: Play },
  { key: "youtube", label: "YouTube", color: "#FF0000", Icon: SiYoutube },
  { key: "tiktok", label: "TikTok", color: "#000000", Icon: SiTiktok },
  { key: "facebook", label: "Facebook", color: "#1877F2", Icon: SiFacebook },
  { key: "x", label: "X (Twitter)", color: "#000000", Icon: SiX },
  { key: "twitter", label: "Twitter", color: "#1DA1F2", Icon: SiTwitter },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", Icon: SiLinkedin },
  { key: "pinterest", label: "Pinterest", color: "#BD081C", Icon: SiPinterest },
  { key: "snapchat", label: "Snapchat", color: "#FFFC00", Icon: SiSnapchat },
  { key: "reddit", label: "Reddit", color: "#FF4500", Icon: SiReddit },
  { key: "discord", label: "Discord", color: "#5865F2", Icon: SiDiscord },
  { key: "twitch", label: "Twitch", color: "#9146FF", Icon: SiTwitch },
  { key: "spotify", label: "Spotify", color: "#1DB954", Icon: SiSpotify },
  { key: "soundcloud", label: "SoundCloud", color: "#FF5500", Icon: SiSoundcloud },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366", Icon: SiWhatsapp },
  { key: "viber", label: "Viber", color: "#7360F2", Icon: SiViber },
  { key: "signal", label: "Signal", color: "#3A76F0", Icon: SiSignal },
  { key: "threads", label: "Threads", color: "#000000", Icon: SiThreads },
  { key: "tumblr", label: "Tumblr", color: "#36465D", Icon: SiTumblr },
  { key: "vimeo", label: "Vimeo", color: "#1AB7EA", Icon: SiVimeo },
  { key: "dailymotion", label: "Dailymotion", color: "#0066DC", Icon: SiDailymotion },
  { key: "yandex", label: "Яндекс", color: "#FF0000", Icon: SiYandex },
  { key: "github", label: "GitHub", color: "#181717", Icon: SiGithub },
  { key: "gitlab", label: "GitLab", color: "#FC6D26", Icon: SiGitlab },
  { key: "medium", label: "Medium", color: "#000000", Icon: SiMedium },
  { key: "dribbble", label: "Dribbble", color: "#EA4C89", Icon: SiDribbble },
  { key: "behance", label: "Behance", color: "#1769FF", Icon: SiBehance },
  { key: "applepodcasts", label: "Apple Podcasts", color: "#9933CC", Icon: SiApplepodcasts },
  { key: "kick", label: "Kick", color: "#53FC18", Icon: SiKick },
  { key: "bluesky", label: "Bluesky", color: "#0285FF", Icon: SiBluesky },
  { key: "mastodon", label: "Mastodon", color: "#6364FF", Icon: SiMastodon },
  { key: "steam", label: "Steam", color: "#000000", Icon: SiSteam },
];

export const ICON_MAP: Record<string, BrandIcon> = Object.fromEntries(
  ICON_LIBRARY.map((i) => [i.key, i]),
);

export const BUILTIN_PREFIX = "builtin:";

export function parseBuiltinIcon(iconUrl: string | null | undefined): BrandIcon | null {
  if (!iconUrl || !iconUrl.startsWith(BUILTIN_PREFIX)) return null;
  const key = iconUrl.slice(BUILTIN_PREFIX.length);
  return ICON_MAP[key] ?? null;
}
