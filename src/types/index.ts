export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export type RoomCategory = 'Private Room' | '2 Bed Room' | '3 Bed Room';
export type AvailabilityStatus = 'available' | 'full' | 'maintenance';

export interface Room {
  id: string;
  title: string;
  category: RoomCategory;
  description: string;
  price: number;
  total_beds: number;
  occupied_beds: number;
  facilities: string[];
  floor: number;
  images: string[];
  availability_status: AvailabilityStatus;
  created_at: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  student_id: string;
  room_id: string;
  booking_status: BookingStatus;
  booking_date: string;
  approved_by: string | null;
  created_at: string;
  room?: Room;
  student?: Profile;
}

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  student_id: string;
  title: string;
  description: string;
  image_url: string | null;
  complaint_status: ComplaintStatus;
  admin_response: string | null;
  created_at: string;
  student?: Profile;
}

export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'rejected';

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  payment_status: PaymentStatus;
  transaction_screenshot: string | null;
  admin_verification: boolean;
  created_at: string;
  student?: Profile;
}

export interface AIPreferences {
  id: string;
  student_id: string;
  budget: number;
  preferred_room_type: RoomCategory | null;
  ac_required: boolean;
  quiet_environment: boolean;
  smoking_preference: boolean;
  study_preference: boolean;
  personality_type: string | null;
  floor_preference: number | null;
  special_notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingComplaints: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface AIRecommendation {
  room: Room;
  compatibility_score: number;
  reasons: string[];
  warnings: string[];
}
