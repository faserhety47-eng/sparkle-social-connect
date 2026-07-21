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
  max: MessageCircle,
  vk: SiVk,
  telegram: SiTelegram,
  ok: SiOdnoklassniki,
  instagram: SiInstagram,
  rutube: Play,
  youtube: SiYoutube,
};
