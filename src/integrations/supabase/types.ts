export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      b2b_qualifications: {
        Row: {
          cable_or_socket: string | null
          car_types: string | null
          charger_count: number | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          discount_applied: boolean | null
          email: string | null
          ev_type: string | null
          features_needed: string[] | null
          has_electrical_prep: boolean | null
          has_own_electrician: boolean | null
          has_solar: boolean | null
          has_wifi: boolean | null
          has_wifi_at_panel: boolean | null
          id: string
          lead_temperature: string | null
          location_type: string | null
          main_fuse: string | null
          needs_load_management: boolean | null
          needs_technical_callback: boolean | null
          next_step: string | null
          notes: string | null
          offer_sent: boolean | null
          phases: string | null
          phone: string | null
          photos_received: boolean | null
          project_type: string | null
          qualification_branch: string | null
          source_b2b_id: string | null
          status: string | null
          timeline: string | null
          updated_at: string
          urgency: string | null
          wants_photos: boolean | null
        }
        Insert: {
          cable_or_socket?: string | null
          car_types?: string | null
          charger_count?: number | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          discount_applied?: boolean | null
          email?: string | null
          ev_type?: string | null
          features_needed?: string[] | null
          has_electrical_prep?: boolean | null
          has_own_electrician?: boolean | null
          has_solar?: boolean | null
          has_wifi?: boolean | null
          has_wifi_at_panel?: boolean | null
          id?: string
          lead_temperature?: string | null
          location_type?: string | null
          main_fuse?: string | null
          needs_load_management?: boolean | null
          needs_technical_callback?: boolean | null
          next_step?: string | null
          notes?: string | null
          offer_sent?: boolean | null
          phases?: string | null
          phone?: string | null
          photos_received?: boolean | null
          project_type?: string | null
          qualification_branch?: string | null
          source_b2b_id?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
          urgency?: string | null
          wants_photos?: boolean | null
        }
        Update: {
          cable_or_socket?: string | null
          car_types?: string | null
          charger_count?: number | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          discount_applied?: boolean | null
          email?: string | null
          ev_type?: string | null
          features_needed?: string[] | null
          has_electrical_prep?: boolean | null
          has_own_electrician?: boolean | null
          has_solar?: boolean | null
          has_wifi?: boolean | null
          has_wifi_at_panel?: boolean | null
          id?: string
          lead_temperature?: string | null
          location_type?: string | null
          main_fuse?: string | null
          needs_load_management?: boolean | null
          needs_technical_callback?: boolean | null
          next_step?: string | null
          notes?: string | null
          offer_sent?: boolean | null
          phases?: string | null
          phone?: string | null
          photos_received?: boolean | null
          project_type?: string | null
          qualification_branch?: string | null
          source_b2b_id?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
          urgency?: string | null
          wants_photos?: boolean | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          car_brand: string | null
          car_model: string | null
          city: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          phone_number: string | null
          raw_data: Json
          status: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          car_brand?: string | null
          car_model?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          raw_data: Json
          status?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          car_brand?: string | null
          car_model?: string | null
          city?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          raw_data?: Json
          status?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
