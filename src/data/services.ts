export type ServiceCategory = {
  id: string;
  name: string;
  color: string; // background color for tile icon
  letter: string; // fallback letter
  emoji?: string;
  description?: string;
};

// 41 platforms mirroring the reference layout (rebranded — same structure, different name)
export const SERVICES: ServiceCategory[] = [
  { id: "telegram", name: "Телеграм", color: "#229ED9", letter: "T", emoji: "✈️", description: "Каналы, группы и боты" },
  { id: "referrals", name: "Рефералы для ботов", color: "#5A78F0", letter: "R", emoji: "🤖", description: "Активные подписчики" },
  { id: "vk", name: "ВКонтакте", color: "#0077FF", letter: "В", description: "Российская социальная сеть" },
  { id: "max", name: "Max", color: "#7B4FFF", letter: "M", description: "Новый мессенджер" },
  { id: "instagram", name: "Инстаграм", color: "#E4405F", letter: "I", emoji: "📷", description: "Фото, Stories, Reels и IGTV" },
  { id: "youtube", name: "Ютуб", color: "#FF0000", letter: "Y", emoji: "▶", description: "Видеоконтент и Shorts" },
  { id: "tiktok", name: "ТикТок", color: "#111111", letter: "T", emoji: "🎵", description: "Короткие вертикальные видео" },
  { id: "twitch", name: "Twitch", color: "#9146FF", letter: "T", description: "Live стриминг и геймплей" },
  { id: "threads", name: "Threads", color: "#000000", letter: "@", description: "Микроблоги от Meta" },
  { id: "rutube", name: "RuTube", color: "#000000", letter: "R", description: "Российский видеохостинг" },
  { id: "twitter", name: "Твиттер", color: "#1DA1F2", letter: "X", description: "Микроблоги и новости" },
  { id: "facebook", name: "Facebook", color: "#1877F2", letter: "f", description: "Глобальная социальная сеть" },
  { id: "ok", name: "Одноклассники", color: "#EE8208", letter: "О", description: "Друзья и семья" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", letter: "in", description: "Профессиональная сеть" },
  { id: "likee", name: "Likee", color: "#F7B500", letter: "L", description: "Короткие видео и эффекты" },
  { id: "web", name: "Трафик на website", color: "#334155", letter: "🌐", emoji: "🌐" },
  { id: "dzen", name: "Яндекс Дзен", color: "#111111", letter: "Д" },
  { id: "yaqa", name: "Яндекс.Кью", color: "#111111", letter: "?" },
  { id: "spotify", name: "Spotify", color: "#1DB954", letter: "S" },
  { id: "discord", name: "Discord", color: "#5865F2", letter: "D" },
  { id: "trovo", name: "Trovo", color: "#00C853", letter: "T" },
  { id: "reddit", name: "Reddit", color: "#FF4500", letter: "R" },
  { id: "soundcloud", name: "SoundCloud", color: "#FF7700", letter: "☁" },
  { id: "nft", name: "NFT", color: "#8B5CF6", letter: "◆" },
  { id: "android", name: "Android и iOS", color: "#3DDC84", letter: "A", emoji: "📱" },
  { id: "snapchat", name: "Snapchat", color: "#FFFC00", letter: "👻", emoji: "👻" },
  { id: "kwai", name: "Kwai", color: "#FF6600", letter: "K" },
  { id: "pinterest", name: "Pinterest", color: "#E60023", letter: "P" },
  { id: "coub", name: "Coub", color: "#153E75", letter: "C" },
  { id: "yappy", name: "Yappi", color: "#00E5A0", letter: "Y" },
  { id: "quora", name: "Quora", color: "#B92B27", letter: "Q" },
  { id: "mixcloud", name: "Mixcloud", color: "#111111", letter: "☁" },
  { id: "rumble", name: "Rumble", color: "#85C742", letter: "▶" },
  { id: "kick", name: "Kick", color: "#53FC18", letter: "K" },
  { id: "vimeo", name: "Vimeo", color: "#1AB7EA", letter: "V" },
  { id: "medium", name: "Medium", color: "#111111", letter: "M" },
  { id: "whatsapp", name: "WhatsApp", color: "#25D366", letter: "W" },
  { id: "tumblr", name: "Tumblr", color: "#36465D", letter: "t" },
  { id: "pikabu", name: "Пикабу", color: "#F0A020", letter: "П" },
  { id: "viber", name: "Viber", color: "#7360F2", letter: "V" },
  { id: "audiomack", name: "Audiomack", color: "#FFA200", letter: "A" },
  { id: "reverbnation", name: "Reverbnation", color: "#E52E1F", letter: "R" },
  { id: "tidal", name: "Tidal", color: "#000000", letter: "T" },
  { id: "other", name: "Другие соц. сети", color: "#64748B", letter: "•••" },
];
