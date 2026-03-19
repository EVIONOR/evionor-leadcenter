// TypeScript types for EVIONOR Supabase Database
// Generated from schema queries

export interface ProductClick {
  id: string;
  questionnaire_response_id: string | null;
  product_name: string;
  product_brand: string;
  product_price: string;
  product_url: string;
  clicked_at: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "rejected" | "auto contacted";

export interface QuestionnaireResponse {
  id: string;
  car_brand: string;
  car_model: string;
  km_per_year: number;
  phases: string;
  location: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  created_at: string;
}

export interface RoiCalculatorResult {
  id: string;
  email: string;
  phone: string;
  selected_car: string;
  car_consumption: number;
  car_onboard_charger: number | null;
  selected_charger: string;
  charger_base_price: number;
  include_installation: boolean;
  include_dynamic_load: boolean;
  total_charger_cost: number;
  annual_km: number;
  home_charging_percentage: number;
  free_charging_percentage: number;
  public_price_per_kwh: number;
  home_price_per_kwh: number;
  months_to_break_even: number | null;
  annual_savings: number | null;
  annual_kwh_needed: number | null;
  years_to_break_even: number | null;
  created_at: string;
}

// Insert types (excluding auto-generated fields)
export interface ProductClickInsert {
  id?: string;
  questionnaire_response_id?: string | null;
  product_name: string;
  product_brand: string;
  product_price: string;
  product_url: string;
  clicked_at?: string;
}

export interface QuestionnaireResponseInsert {
  id?: string;
  car_brand: string;
  car_model: string;
  km_per_year: number;
  phases: string;
  location: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  status?: LeadStatus;
  created_at?: string;
}

export interface RoiCalculatorResultInsert {
  id?: string;
  email: string;
  phone: string;
  selected_car: string;
  car_consumption: number;
  car_onboard_charger?: number | null;
  selected_charger: string;
  charger_base_price: number;
  include_installation: boolean;
  include_dynamic_load: boolean;
  total_charger_cost: number;
  annual_km: number;
  home_charging_percentage: number;
  free_charging_percentage: number;
  public_price_per_kwh: number;
  home_price_per_kwh: number;
  months_to_break_even?: number | null;
  annual_savings?: number | null;
  annual_kwh_needed?: number | null;
  years_to_break_even?: number | null;
  created_at?: string;
}

// Update types (all fields optional)
export interface ProductClickUpdate {
  id?: string;
  questionnaire_response_id?: string | null;
  product_name?: string;
  product_brand?: string;
  product_price?: string;
  product_url?: string;
  clicked_at?: string;
}

export interface QuestionnaireResponseUpdate {
  id?: string;
  car_brand?: string;
  car_model?: string;
  km_per_year?: number;
  phases?: string;
  location?: string;
  timeline?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  created_at?: string;
}

export interface RoiCalculatorResultUpdate {
  id?: string;
  email?: string;
  phone?: string;
  selected_car?: string;
  car_consumption?: number;
  car_onboard_charger?: number | null;
  selected_charger?: string;
  charger_base_price?: number;
  include_installation?: boolean;
  include_dynamic_load?: boolean;
  total_charger_cost?: number;
  annual_km?: number;
  home_charging_percentage?: number;
  free_charging_percentage?: number;
  public_price_per_kwh?: number;
  home_price_per_kwh?: number;
  months_to_break_even?: number | null;
  annual_savings?: number | null;
  annual_kwh_needed?: number | null;
  years_to_break_even?: number | null;
  created_at?: string;
}

export interface SavedQuestionnaireResponse {
  id: string;
  original_response_id: string | null;
  contact_name: string;
  email: string;
  phone_number: string;
  car_brand: string;
  car_model: string;
  custom_car: string | null;
  zip_code: string;
  city: string;
  phases: string;
  amperage: string;
  install_location: string;
  building_type: string | null;
  needs_installation: boolean;
  needs_electrical_planning: boolean;
  indoor_outdoor: string;
  mounting_surface: string | null;
  needs_backplate: boolean;
  needs_pole: boolean;
  distance_from_box: string;
  space_in_box: string;
  groundwork_wall_penetration: string | null;
  other_comments: string | null;
  solar_integration: string;
  load_management: boolean;
  built_in_cable: boolean;
  needs_app: boolean;
  infrastructure_development: boolean;
  infrastructure_details: string | null;
  overvoltage_protection: boolean;
  network_expansion: boolean;
  expansion_phase: string | null;
  expansion_amperage: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedQuestionnaireResponseInsert {
  id?: string;
  original_response_id?: string | null;
  contact_name: string;
  email: string;
  phone_number: string;
  car_brand: string;
  car_model: string;
  custom_car?: string | null;
  zip_code: string;
  city: string;
  phases: string;
  amperage: string;
  install_location: string;
  building_type?: string | null;
  needs_installation?: boolean;
  needs_electrical_planning?: boolean;
  indoor_outdoor: string;
  mounting_surface?: string | null;
  needs_backplate?: boolean;
  needs_pole?: boolean;
  distance_from_box: string;
  space_in_box: string;
  groundwork_wall_penetration?: string | null;
  other_comments?: string | null;
  solar_integration: string;
  load_management?: boolean;
  built_in_cable?: boolean;
  needs_app?: boolean;
  infrastructure_development?: boolean;
  infrastructure_details?: string | null;
  overvoltage_protection?: boolean;
  network_expansion?: boolean;
  expansion_phase?: string | null;
  expansion_amperage?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeadManagerSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
  updated_by: string | null;
}

export interface B2BQuestionnaireResponse {
  id: string;
  company_name: string | null;
  name: string;
  email: string;
  phone: string;
  fleet_count: number;
  km_per_year: number;
  charging_stations: number;
  home_chargers: number;
  phases: string | null;
  location: string;
  timeline: string;
  usage_environment: string | null;
  data_consent: boolean;
  created_at: string;
}

export interface LeadManagerSettingInsert {
  id?: string;
  setting_key: string;
  setting_value: any;
  updated_at?: string;
  updated_by?: string | null;
}

// Database type
export interface EvionorDatabase {
  public: {
    Tables: {
      product_clicks: {
        Row: ProductClick;
        Insert: ProductClickInsert;
        Update: ProductClickUpdate;
      };
      questionnaire_responses: {
        Row: QuestionnaireResponse;
        Insert: QuestionnaireResponseInsert;
        Update: QuestionnaireResponseUpdate;
      };
      roi_calculator_results: {
        Row: RoiCalculatorResult;
        Insert: RoiCalculatorResultInsert;
        Update: RoiCalculatorResultUpdate;
      };
      saved_questionnaire_responses: {
        Row: SavedQuestionnaireResponse;
        Insert: SavedQuestionnaireResponseInsert;
        Update: Partial<SavedQuestionnaireResponseInsert>;
      };
      lead_manager_settings: {
        Row: LeadManagerSetting;
        Insert: LeadManagerSettingInsert;
        Update: Partial<LeadManagerSettingInsert>;
      };
    };
  };
}
