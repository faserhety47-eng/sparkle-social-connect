import maxIcon from "@/assets/max-icon.png.asset.json";
import {
  SiTelegram,
  SiVk,
  SiInstagram,
  SiYoutube,
  SiOdnoklassniki,
} from "@icons-pack/react-simple-icons";
import { MessageCircle, Play, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>> | LucideIcon;

export const BRAND_ICONS: Record<string, IconCmp> = {
  vk: SiVk,
  telegram: SiTelegram,
  ok: SiOdnoklassniki,
  instagram: SiInstagram,
  rutube: Play,
  youtube: SiYoutube,
};

// Fallback image icons for platforms without a simple-icon SVG.
export const BRAND_IMAGE_ICONS: Record<string, string> = {
  max: maxIcon.url,
};
