INSERT INTO public.platforms (id, name, is_active, sort_order, description, color, icon_url, letter)
VALUES ('tiktok', 'TikTok', true, 35, 'Короткие вертикальные видео', '#000000', 'builtin:tiktok', 'T')
ON CONFLICT (id) DO NOTHING;