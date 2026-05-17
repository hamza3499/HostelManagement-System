-- ============================================
-- HMS - Hostel Management System
-- Complete Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Private Room', '2 Bed Room', '3 Bed Room')),
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_beds INTEGER NOT NULL DEFAULT 1,
  occupied_beds INTEGER NOT NULL DEFAULT 0,
  facilities TEXT[] DEFAULT '{}',
  floor INTEGER NOT NULL DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'full', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT occupied_lte_total CHECK (occupied_beds <= total_beds)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  complaint_status TEXT NOT NULL DEFAULT 'pending' CHECK (complaint_status IN ('pending', 'in_progress', 'resolved')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fees table
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'rejected')),
  transaction_screenshot TEXT,
  admin_verification BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Preferences table
CREATE TABLE IF NOT EXISTS public.ai_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  budget DECIMAL(10, 2) NOT NULL,
  preferred_room_type TEXT CHECK (preferred_room_type IN ('Private Room', '2 Bed Room', '3 Bed Room')),
  ac_required BOOLEAN DEFAULT FALSE,
  quiet_environment BOOLEAN DEFAULT TRUE,
  smoking_preference BOOLEAN DEFAULT FALSE,
  study_preference BOOLEAN DEFAULT TRUE,
  personality_type TEXT CHECK (personality_type IN ('introvert', 'extrovert', 'ambivert')),
  floor_preference INTEGER,
  special_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Profile created on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- ROOMS POLICIES
-- ============================================
CREATE POLICY "Anyone authenticated can view rooms" ON public.rooms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================
-- BOOKINGS POLICIES
-- ============================================
CREATE POLICY "Students can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can cancel own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = student_id AND booking_status = 'pending');

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================
-- COMPLAINTS POLICIES
-- ============================================
CREATE POLICY "Students can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create own complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================
-- FEES POLICIES
-- ============================================
CREATE POLICY "Students can view own fees" ON public.fees
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can upload payment proof" ON public.fees
  FOR UPDATE USING (auth.uid() = student_id AND payment_status = 'unpaid');

CREATE POLICY "Admins can manage all fees" ON public.fees
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================
-- AI PREFERENCES POLICIES
-- ============================================
CREATE POLICY "Students can manage own ai preferences" ON public.ai_preferences
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all ai preferences" ON public.ai_preferences
  FOR SELECT USING (get_user_role() = 'admin');

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update room occupied_beds when booking is approved
CREATE OR REPLACE FUNCTION public.handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_status = 'approved' AND OLD.booking_status = 'pending' THEN
    UPDATE public.rooms
    SET occupied_beds = occupied_beds + 1
    WHERE id = NEW.room_id;
    
    -- Mark room as full if needed
    UPDATE public.rooms
    SET availability_status = 'full'
    WHERE id = NEW.room_id AND occupied_beds >= total_beds;
    
    -- Send notification to student
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (NEW.student_id, 'Booking Approved!', 'Your room booking has been approved. Welcome to your new room!');
    
  ELSIF NEW.booking_status = 'rejected' AND OLD.booking_status = 'pending' THEN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (NEW.student_id, 'Booking Update', 'Your room booking request has been rejected. Please contact admin for more info.');
    
  ELSIF NEW.booking_status = 'cancelled' AND OLD.booking_status = 'approved' THEN
    UPDATE public.rooms
    SET occupied_beds = GREATEST(occupied_beds - 1, 0)
    WHERE id = NEW.room_id;
    
    UPDATE public.rooms
    SET availability_status = 'available'
    WHERE id = NEW.room_id AND occupied_beds < total_beds AND availability_status = 'full';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_status_change();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('room-images', 'room-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('payment-screenshots', 'payment-screenshots', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('complaint-images', 'complaint-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-images', 'profile-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Room images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Admins can upload room images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'room-images' AND get_user_role() = 'admin');

CREATE POLICY "Students can upload payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Students can view own payment screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      get_user_role() = 'admin'
    )
  );

CREATE POLICY "Students can upload complaint images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'complaint-images' AND auth.role() = 'authenticated');

CREATE POLICY "Complaint images viewable by owner and admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'complaint-images' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      get_user_role() = 'admin'
    )
  );

CREATE POLICY "Profile images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile image" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- SEED DATA
-- ============================================

-- Sample rooms
INSERT INTO public.rooms (title, category, description, price, total_beds, occupied_beds, facilities, floor, availability_status) VALUES
  ('Deluxe Private Suite', 'Private Room', 'A spacious private room with en-suite bathroom, study desk, and city view. Perfect for students who value privacy and focus.', 15000, 1, 0, ARRAY['WiFi', 'AC', 'Private Bathroom', 'Study Desk', 'Wardrobe', 'TV'], 3, 'available'),
  ('Executive Private Room', 'Private Room', 'Premium private room with modern furnishings, high-speed WiFi, and 24/7 security access.', 12000, 1, 1, ARRAY['WiFi', 'AC', 'Shared Bathroom', 'Study Desk', 'Wardrobe'], 2, 'full'),
  ('Twin Shared Room A', '2 Bed Room', 'Comfortable twin room designed for students who prefer a social environment while maintaining personal space.', 8000, 2, 1, ARRAY['WiFi', 'AC', 'Shared Bathroom', 'Study Desks', 'Wardrobes'], 1, 'available'),
  ('Twin Shared Room B', '2 Bed Room', 'Budget-friendly twin room on the ground floor with garden view. Great for social butterflies.', 7000, 2, 0, ARRAY['WiFi', 'Shared Bathroom', 'Study Desks', 'Wardrobes', 'Fan'], 1, 'available'),
  ('Triple Shared Room', '3 Bed Room', 'Economical triple room with ample space and storage. Ideal for students on a tight budget.', 5000, 3, 2, ARRAY['WiFi', 'Shared Bathroom', 'Study Desks', 'Wardrobes', 'Fan'], 2, 'available'),
  ('Premium Triple Suite', '3 Bed Room', 'Well-ventilated triple room with AC and common study area access. Great community atmosphere.', 6500, 3, 0, ARRAY['WiFi', 'AC', 'Shared Bathroom', 'Study Desks', 'Common Area'], 4, 'available');
