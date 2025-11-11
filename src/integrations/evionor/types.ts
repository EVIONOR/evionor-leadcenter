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
    };
  };
}
