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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          checked_in_at: string | null
          class_instance_id: number
          created_at: string
          id: number
          payment_id: number | null
          payment_status: string
          qr_code: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          checked_in_at?: string | null
          class_instance_id: number
          created_at?: string
          id?: never
          payment_id?: number | null
          payment_status?: string
          qr_code?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          checked_in_at?: string | null
          class_instance_id?: number
          created_at?: string
          id?: never
          payment_id?: number | null
          payment_status?: string
          qr_code?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_class_instance_id_fkey"
            columns: ["class_instance_id"]
            isOneToOne: false
            referencedRelation: "class_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_payment_id"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      class_instances: {
        Row: {
          class_id: number
          current_bookings: number
          ends_at: string
          id: number
          instructor_id: string | null
          is_cancelled: boolean
          scheduled_at: string
        }
        Insert: {
          class_id: number
          current_bookings?: number
          ends_at: string
          id?: never
          instructor_id?: string | null
          is_cancelled?: boolean
          scheduled_at: string
        }
        Update: {
          class_id?: number
          current_bookings?: number
          ends_at?: string
          id?: never
          instructor_id?: string | null
          is_cancelled?: boolean
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_instances_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_id: number
          day_of_week: number
          end_time: string
          id: number
          is_active: boolean
          start_time: string
        }
        Insert: {
          class_id: number
          day_of_week: number
          end_time: string
          id?: never
          is_active?: boolean
          start_time: string
        }
        Update: {
          class_id?: number
          day_of_week?: number
          end_time?: string
          id?: never
          is_active?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number
          id: number
          is_active: boolean
          name: string
          price: number
          studio_id: number
          type: string
          updated_at: string
          zoom_link: string | null
        }
        Insert: {
          capacity: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes: number
          id?: never
          is_active?: boolean
          name: string
          price: number
          studio_id: number
          type: string
          updated_at?: string
          zoom_link?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: never
          is_active?: boolean
          name?: string
          price?: number
          studio_id?: number
          type?: string
          updated_at?: string
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_check_ins: {
        Row: {
          check_in_method: string
          checked_by: string | null
          checked_in_at: string
          created_at: string
          id: number
          membership_id: number
        }
        Insert: {
          check_in_method: string
          checked_by?: string | null
          checked_in_at?: string
          created_at?: string
          id?: never
          membership_id: number
        }
        Update: {
          check_in_method?: string
          checked_by?: string | null
          checked_in_at?: string
          created_at?: string
          id?: never
          membership_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "membership_check_ins_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_months: number
          id: number
          is_active: boolean
          name: string
          price: number
          studio_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months: number
          id?: never
          is_active?: boolean
          name: string
          price: number
          studio_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months?: number
          id?: never
          is_active?: boolean
          name?: string
          price?: number
          studio_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          membership_plan_id: number
          payment_id: number | null
          purchased_at: string
          qr_code: string | null
          status: string
          student_id: string
          studio_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: never
          membership_plan_id: number
          payment_id?: number | null
          purchased_at?: string
          qr_code?: string | null
          status?: string
          student_id: string
          studio_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: never
          membership_plan_id?: number
          payment_id?: number | null
          purchased_at?: string
          qr_code?: string | null
          status?: string
          student_id?: string
          studio_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: number
          created_at: string
          currency: string
          gateway: string
          gateway_transaction_id: string | null
          id: number
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: number
          created_at?: string
          currency?: string
          gateway: string
          gateway_transaction_id?: string | null
          id?: never
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_transaction_id?: string | null
          id?: never
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          address: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: number
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_booking_capacity: {
        Args: { class_instance_id_param: number }
        Returns: boolean
      }
      check_membership_validity: {
        Args: { membership_id_param: number }
        Returns: boolean
      }
      expire_memberships: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_membership_qr_code: {
        Args: { membership_id_param: number }
        Returns: string
      }
      generate_qr_code: { Args: { booking_id_param: number }; Returns: string }
      update_user_role: {
        Args: { new_role: string; user_id_param: string }
        Returns: undefined
      }
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
