ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#7B4FFF',
  ADD COLUMN IF NOT EXISTS icon_url TEXT,
  ADD COLUMN IF NOT EXISTS icon_emoji TEXT,
  ADD COLUMN IF NOT EXISTS letter TEXT;

UPDATE public.platforms SET color = '#7B4FFF', letter = 'M', description = 'Новый мессенджер' WHERE id = 'max' AND description IS NULL;
UPDATE public.platforms SET color = '#0077FF', letter = 'В', description = 'Российская социальная сеть' WHERE id = 'vk' AND description IS NULL;
UPDATE public.platforms SET color = '#229ED9', letter = 'T', description = 'Каналы, группы и боты' WHERE id = 'telegram' AND description IS NULL;
UPDATE public.platforms SET color = '#EE8208', letter = 'О', description = 'Друзья и семья' WHERE id = 'ok' AND description IS NULL;
UPDATE public.platforms SET color = '#E4405F', letter = 'I', description = 'Фото, Stories, Reels и IGTV' WHERE id = 'instagram' AND description IS NULL;
UPDATE public.platforms SET color = '#000000', letter = 'R', description = 'Российский видеохостинг' WHERE id = 'rutube' AND description IS NULL;
UPDATE public.platforms SET color = '#FF0000', letter = 'Y', description = 'Видеоконтент и Shorts' WHERE id = 'youtube' AND description IS NULL;