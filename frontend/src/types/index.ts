export interface User {
  id: string;
  email: string;
  user_metadata: {
    role: 'restaurant' | 'ngo' | 'volunteer';
    name: string;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface NGO {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  created_at: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  vehicle_type: string;
  availability: boolean;
  created_at: string;
}

export type DonationStatus = 
  | 'processing'
  | 'pending'
  | 'notified'
  | 'accepted'
  | 'volunteer_assigned'
  | 'picked_up'
  | 'completed'
  | 'expired';

export interface Donation {
  id: string;
  restaurant_id: string;
  food_name: string;
  description: string;
  ai_description?: string;
  shelf_life_guidance?: string;
  quantity: string;
  servings: number;
  food_type: string;
  cooked_time: string;
  expiry_time: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  status: DonationStatus;
  notified_ngo_id?: string;
  accepted_ngo_id?: string;
  assigned_volunteer_id?: string;
  created_at: string;
  restaurants?: { name: string; address: string; phone?: string };
  volunteer_assignments?: VolunteerAssignment[];
}

export interface VolunteerAssignment {
  id: string;
  donation_id: string;
  volunteer_id: string;
  ngo_id?: string;
  otp?: string;
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  status: 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'rejected';
  donations?: Donation;
  volunteers?: Volunteer;
  ngos?: NGO;
}

export interface Notification {
  id: string;
  recipient_type: 'restaurant' | 'ngo' | 'volunteer';
  recipient_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  donation_id: string;
  certificate_id: string;
  certificate_url: string;
  generated_at: string;
  donations?: Partial<Donation>;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending?: number;
  expired?: number;
  totalServings?: number;
  certificates?: number;
  mealsReceived?: number;
  active?: number;
  mealsDelivered?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
