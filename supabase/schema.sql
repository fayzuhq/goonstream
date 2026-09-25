-- Types
CREATE TYPE user_role AS ENUM ('uploader', 'manager', 'moderator', 'admin', 'owner');
CREATE TYPE report_status AS ENUM ('open', 'closed');

-- Tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role user_role NOT NULL DEFAULT 'uploader',
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    discord_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    views_fake INTEGER DEFAULT 0,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
    is_featured_home BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE public.video_tags (
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Indexes
CREATE INDEX idx_videos_is_featured_home ON public.videos(is_featured_home) WHERE is_featured_home = true;
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_views_fake ON public.videos(views_fake DESC);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by users who created them." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by admin and owner." ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner'))
);
-- Admins/owners can insert/update/delete
CREATE POLICY "Admins and owners can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner'))
);
CREATE POLICY "Admins and owners can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner'))
);
CREATE POLICY "Admins and owners can delete profiles" ON public.profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner'))
);

-- Channels Policies
CREATE POLICY "Channels are viewable by everyone." ON public.channels FOR SELECT USING (true);
CREATE POLICY "Managers, admins, owners can insert channels" ON public.channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);
CREATE POLICY "Managers, admins, owners can update channels" ON public.channels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);
CREATE POLICY "Managers, admins, owners can delete channels" ON public.channels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);

-- Tags Policies
CREATE POLICY "Tags are viewable by everyone." ON public.tags FOR SELECT USING (true);
CREATE POLICY "Managers, admins, owners can insert tags" ON public.tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);
CREATE POLICY "Managers, admins, owners can update tags" ON public.tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);
CREATE POLICY "Managers, admins, owners can delete tags" ON public.tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);

-- Videos Policies
CREATE POLICY "Videos are viewable by everyone." ON public.videos FOR SELECT USING (true);
CREATE POLICY "Uploaders, managers, admins, owners can insert videos" ON public.videos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('uploader', 'manager', 'admin', 'owner'))
);
CREATE POLICY "Uploaders, managers, admins, owners can update videos" ON public.videos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('uploader', 'manager', 'admin', 'owner'))
);
CREATE POLICY "Managers, admins, owners can delete videos" ON public.videos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('manager', 'admin', 'owner'))
);

-- Video Tags Policies
CREATE POLICY "Video tags are viewable by everyone." ON public.video_tags FOR SELECT USING (true);
CREATE POLICY "Uploaders, managers, admins, owners can insert video tags" ON public.video_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('uploader', 'manager', 'admin', 'owner'))
);
CREATE POLICY "Uploaders, managers, admins, owners can update video tags" ON public.video_tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('uploader', 'manager', 'admin', 'owner'))
);
CREATE POLICY "Uploaders, managers, admins, owners can delete video tags" ON public.video_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('uploader', 'manager', 'admin', 'owner'))
);

-- Reports Policies
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Moderators, admins, owners can view reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator', 'admin', 'owner'))
);
CREATE POLICY "Moderators, admins, owners can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator', 'admin', 'owner'))
);
CREATE POLICY "Moderators, admins, owners can delete reports" ON public.reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('moderator', 'admin', 'owner'))
);

-- Trigger to automatically create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, must_change_password)
  VALUES (new.id, new.email, 'uploader', true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Database Function for Top 5 Videos of the Week (based on views_fake in last 7 days)
-- We'll assume views_fake is cumulative, so just sort by it for videos created in the last 7 days,
-- or you could just sort all videos by views_fake. "sur les 7 derniers jours" implies recently popular.
-- For simplicity, we just sort by views_fake among videos created in the last 7 days.
CREATE OR REPLACE FUNCTION get_top_videos_week()
RETURNS SETOF public.videos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.videos
  WHERE created_at >= NOW() - INTERVAL '7 days'
  ORDER BY views_fake DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;
