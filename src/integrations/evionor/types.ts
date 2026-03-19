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
      b2b_questionnaire_responses: {
        Row: {
          charging_stations: number
          company_name: string | null
          created_at: string
          data_consent: boolean
          email: string
          fleet_count: number
          home_chargers: number
          id: string
          km_per_year: number
          location: string
          name: string
          phases: string | null
          phone: string
          timeline: string
          usage_environment: string | null
        }
        Insert: {
          charging_stations?: number
          company_name?: string | null
          created_at?: string
          data_consent?: boolean
          email: string
          fleet_count: number
          home_chargers?: number
          id?: string
          km_per_year: number
          location: string
          name: string
          phases?: string | null
          phone: string
          timeline: string
          usage_environment?: string | null
        }
        Update: {
          charging_stations?: number
          company_name?: string | null
          created_at?: string
          data_consent?: boolean
          email?: string
          fleet_count?: number
          home_chargers?: number
          id?: string
          km_per_year?: number
          location?: string
          name?: string
          phases?: string | null
          phone?: string
          timeline?: string
          usage_environment?: string | null
        }
        Relationships: []
      }
      lead_manager_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_clicks: {
        Row: {
          clicked_at: string
          id: string
          product_brand: string
          product_name: string
          product_price: string
          product_url: string
          questionnaire_response_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          product_brand: string
          product_name: string
          product_price: string
          product_url: string
          questionnaire_response_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          product_brand?: string
          product_name?: string
          product_price?: string
          product_url?: string
          questionnaire_response_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_clicks_questionnaire_response_id_fkey"
            columns: ["questionnaire_response_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          car_brand: string
          car_model: string
          created_at: string
          email: string
          id: string
          km_per_year: number
          location: string
          name: string
          phases: string
          phone: string
          status: Database["public"]["Enums"]["lead_status"] | null
          timeline: string
        }
        Insert: {
          car_brand: string
          car_model: string
          created_at?: string
          email: string
          id?: string
          km_per_year: number
          location: string
          name: string
          phases: string
          phone: string
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline: string
        }
        Update: {
          car_brand?: string
          car_model?: string
          created_at?: string
          email?: string
          id?: string
          km_per_year?: number
          location?: string
          name?: string
          phases?: string
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"] | null
          timeline?: string
        }
        Relationships: []
      }
      roi_calculator_results: {
        Row: {
          annual_km: number
          annual_kwh_needed: number | null
          annual_savings: number | null
          car_consumption: number
          car_onboard_charger: number | null
          charger_base_price: number
          created_at: string
          email: string
          free_charging_percentage: number
          home_charging_percentage: number
          home_price_per_kwh: number
          id: string
          include_dynamic_load: boolean
          include_installation: boolean
          months_to_break_even: number | null
          phone: string
          public_price_per_kwh: number
          selected_car: string
          selected_charger: string
          total_charger_cost: number
          years_to_break_even: number | null
        }
        Insert: {
          annual_km: number
          annual_kwh_needed?: number | null
          annual_savings?: number | null
          car_consumption: number
          car_onboard_charger?: number | null
          charger_base_price: number
          created_at?: string
          email: string
          free_charging_percentage?: number
          home_charging_percentage?: number
          home_price_per_kwh: number
          id?: string
          include_dynamic_load?: boolean
          include_installation?: boolean
          months_to_break_even?: number | null
          phone: string
          public_price_per_kwh: number
          selected_car: string
          selected_charger: string
          total_charger_cost: number
          years_to_break_even?: number | null
        }
        Update: {
          annual_km?: number
          annual_kwh_needed?: number | null
          annual_savings?: number | null
          car_consumption?: number
          car_onboard_charger?: number | null
          charger_base_price?: number
          created_at?: string
          email?: string
          free_charging_percentage?: number
          home_charging_percentage?: number
          home_price_per_kwh?: number
          id?: string
          include_dynamic_load?: boolean
          include_installation?: boolean
          months_to_break_even?: number | null
          phone?: string
          public_price_per_kwh?: number
          selected_car?: string
          selected_charger?: string
          total_charger_cost?: number
          years_to_break_even?: number | null
        }
        Relationships: []
      }
      saved_questionnaire_responses: {
        Row: {
          amperage: string
          building_type: string | null
          built_in_cable: boolean
          car_brand: string
          car_model: string
          city: string
          contact_name: string
          created_at: string | null
          created_by: string | null
          custom_car: string | null
          distance_from_box: string
          email: string
          expansion_amperage: string | null
          expansion_phase: string | null
          groundwork_wall_penetration: string | null
          id: string
          indoor_outdoor: string
          infrastructure_details: string | null
          infrastructure_development: boolean
          install_location: string
          load_management: boolean
          mounting_surface: string | null
          needs_app: boolean
          needs_backplate: boolean
          needs_electrical_planning: boolean
          needs_installation: boolean
          needs_pole: boolean
          network_expansion: boolean
          original_response_id: string | null
          other_comments: string | null
          overvoltage_protection: boolean
          phases: string
          phone_number: string
          solar_integration: string
          space_in_box: string
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          amperage: string
          building_type?: string | null
          built_in_cable?: boolean
          car_brand: string
          car_model: string
          city: string
          contact_name: string
          created_at?: string | null
          created_by?: string | null
          custom_car?: string | null
          distance_from_box: string
          email: string
          expansion_amperage?: string | null
          expansion_phase?: string | null
          groundwork_wall_penetration?: string | null
          id?: string
          indoor_outdoor: string
          infrastructure_details?: string | null
          infrastructure_development?: boolean
          install_location: string
          load_management?: boolean
          mounting_surface?: string | null
          needs_app?: boolean
          needs_backplate?: boolean
          needs_electrical_planning?: boolean
          needs_installation?: boolean
          needs_pole?: boolean
          network_expansion?: boolean
          original_response_id?: string | null
          other_comments?: string | null
          overvoltage_protection?: boolean
          phases: string
          phone_number: string
          solar_integration: string
          space_in_box: string
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          amperage?: string
          building_type?: string | null
          built_in_cable?: boolean
          car_brand?: string
          car_model?: string
          city?: string
          contact_name?: string
          created_at?: string | null
          created_by?: string | null
          custom_car?: string | null
          distance_from_box?: string
          email?: string
          expansion_amperage?: string | null
          expansion_phase?: string | null
          groundwork_wall_penetration?: string | null
          id?: string
          indoor_outdoor?: string
          infrastructure_details?: string | null
          infrastructure_development?: boolean
          install_location?: string
          load_management?: boolean
          mounting_surface?: string | null
          needs_app?: boolean
          needs_backplate?: boolean
          needs_electrical_planning?: boolean
          needs_installation?: boolean
          needs_pole?: boolean
          network_expansion?: boolean
          original_response_id?: string | null
          other_comments?: string | null
          overvoltage_protection?: boolean
          phases?: string
          phone_number?: string
          solar_integration?: string
          space_in_box?: string
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_table_schema: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_tables_list: {
        Args: never
        Returns: {
          table_name: string
          table_schema: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "converted"
        | "rejected"
        | "auto contacted"
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
    Enums: {
      app_role: ["admin", "user"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "rejected",
        "auto contacted",
      ],
    },
  },
} as const
