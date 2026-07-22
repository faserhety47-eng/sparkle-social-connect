export type ServiceCategory = {
  id: string;
  name: string;
  color: string; // background color for tile icon
  letter: string; // fallback letter
  emoji?: string;
  icon_url?: string;
  description?: string;
};

// Selected platforms only
export const SERVICES: ServiceCategory[] = [
  { id: "max", name: "Max", color: "#3B6BFF", letter: "M", icon_url: "builtin:max-app", description: "Новый мессенджер" },
  { id: "vk", name: "ВКонтакте", color: "#0077FF", letter: "В", description: "Российская социальная сеть" },
  { id: "tiktok", name: "TikTok", color: "#000000", letter: "T", icon_url: "builtin:tiktok", description: "Короткие вертикальные видео" },
  { id: "telegram", name: "Телеграм", color: "#229ED9", letter: "T", description: "Каналы, группы и боты" },
  { id: "ok", name: "Одноклассники", color: "#EE8208", letter: "О", description: "Друзья и семья" },
  { id: "instagram", name: "Инстаграм", color: "#E4405F", letter: "I", description: "Фото, Stories, Reels и IGTV" },
  { id: "rutube", name: "RuTube", color: "#000000", letter: "R", description: "Российский видеохостинг" },
  { id: "youtube", name: "Ютуб", color: "#FF0000", letter: "Y", description: "Видеоконтент и Shorts" },
];
