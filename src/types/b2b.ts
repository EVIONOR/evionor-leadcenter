export interface B2BQualification {
  id: string;
  source_b2b_id: string | null;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  project_type: string | null;
  location_type: string | null;
  charger_count: number | null;
  urgency: string | null;
  has_own_electrician: boolean | null;
  qualification_branch: string | null; // 'A' | 'B' | 'C'
  // Branch A fields
  car_types: string | null;
  ev_type: string | null;
  phases: string | null;
  main_fuse: string | null;
  needs_load_management: boolean | null;
  has_solar: boolean | null;
  has_wifi: boolean | null;
  cable_or_socket: string | null;
  features_needed: string[];
  offer_sent: boolean;
  discount_applied: boolean;
  // Branch B fields
  has_electrical_prep: boolean | null;
  wants_photos: boolean | null;
  photos_received: boolean;
  needs_technical_callback: boolean;
  // Closing
  lead_temperature: string | null; // 'hot' | 'warm' | 'cold'
  next_step: string | null;
  notes: string | null;
  status: string | null;
  timeline: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2BQualificationInsert {
  source_b2b_id?: string | null;
  company_name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  project_type?: string | null;
  location_type?: string | null;
  charger_count?: number | null;
  urgency?: string | null;
  has_own_electrician?: boolean | null;
  qualification_branch?: string | null;
  car_types?: string | null;
  ev_type?: string | null;
  phases?: string | null;
  main_fuse?: string | null;
  needs_load_management?: boolean | null;
  has_solar?: boolean | null;
  has_wifi?: boolean | null;
  cable_or_socket?: string | null;
  features_needed?: string[];
  offer_sent?: boolean;
  discount_applied?: boolean;
  has_electrical_prep?: boolean | null;
  wants_photos?: boolean | null;
  photos_received?: boolean;
  needs_technical_callback?: boolean;
  lead_temperature?: string | null;
  next_step?: string | null;
  notes?: string | null;
  status?: string | null;
  timeline?: string | null;
}
