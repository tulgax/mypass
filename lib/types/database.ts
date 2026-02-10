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
          {
            foreignKeyName: "class_instances_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      plans: {
        Row: {
          id: number
          studio_id: number
          name: string
          description: string | null
          image_url: string | null
          payment_type: string
          price: number
          currency: string
          billing_period_months: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          studio_id: number
          name: string
          description?: string | null
          image_url?: string | null
          payment_type: string
          price: number
          currency?: string
          billing_period_months?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          studio_id?: number
          name?: string
          description?: string | null
          image_url?: string | null
          payment_type?: string
          price?: number
          currency?: string
          billing_period_months?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_items: {
        Row: {
          id: number
          plan_id: number
          class_id: number
          quantity: number
        }
        Insert: {
          id?: never
          plan_id: number
          class_id: number
          quantity: number
        }
        Update: {
          id?: never
          plan_id?: number
          class_id?: number
          quantity?: number
        }
        Relationships: [
          { foreignKeyName: "plan_items_plan_id_fkey", columns: ["plan_id"], isOneToOne: false, referencedRelation: "plans", referencedColumns: ["id"] },
          { foreignKeyName: "plan_items_class_id_fkey", columns: ["class_id"], isOneToOne: false, referencedRelation: "classes", referencedColumns: ["id"] },
        ]
      }
      plan_benefits: {
        Row: {
          id: number
          plan_id: number
          benefit_text: string
          sort_order: number
        }
        Insert: {
          id?: never
          plan_id: number
          benefit_text: string
          sort_order?: number
        }
        Update: {
          id?: never
          plan_id?: number
          benefit_text?: string
          sort_order?: number
        }
        Relationships: [
          { foreignKeyName: "plan_benefits_plan_id_fkey", columns: ["plan_id"], isOneToOne: false, referencedRelation: "plans", referencedColumns: ["id"] },
        ]
      }
      studios: {
        Row: {
          address: string | null
          country: string | null
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
          country?: string | null
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
          country?: string | null
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
      studio_team_members: {
        Row: {
          id: number
          studio_id: number
          user_id: string
          role: string
          invited_at: string
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          studio_id: number
          user_id: string
          role: string
          invited_at?: string
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          studio_id?: number
          user_id?: string
          role?: string
          invited_at?: string
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_team_members_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_classes: {
        Row: {
          access_duration_days: number
          category: string | null
          created_at: string
          created_by: string
          currency: string
          description: string | null
          difficulty_level: string | null
          duration_seconds: number | null
          id: number
          instructor_id: string | null
          is_active: boolean
          is_featured: boolean
          mux_asset_id: string | null
          mux_playback_id: string | null
          mux_status: string
          mux_upload_id: string | null
          preview_mux_asset_id: string | null
          preview_mux_playback_id: string | null
          preview_mux_upload_id: string | null
          price: number
          sort_order: number
          studio_id: number
          tags: string[]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_duration_days?: number
          category?: string | null
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: never
          instructor_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_status?: string
          mux_upload_id?: string | null
          preview_mux_asset_id?: string | null
          preview_mux_playback_id?: string | null
          preview_mux_upload_id?: string | null
          price: number
          sort_order?: number
          studio_id: number
          tags?: string[]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_duration_days?: number
          category?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: never
          instructor_id?: string | null
          is_active?: boolean
          is_featured?: boolean
          mux_asset_id?: string | null
          mux_playback_id?: string | null
          mux_status?: string
          mux_upload_id?: string | null
          preview_mux_asset_id?: string | null
          preview_mux_playback_id?: string | null
          preview_mux_upload_id?: string | null
          price?: number
          sort_order?: number
          studio_id?: number
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_classes_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      video_purchases: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          gateway: string | null
          gateway_transaction_id: string | null
          id: number
          purchased_at: string | null
          status: string
          student_id: string
          updated_at: string
          video_class_id: number
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          gateway?: string | null
          gateway_transaction_id?: string | null
          id?: never
          purchased_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
          video_class_id: number
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          gateway?: string | null
          gateway_transaction_id?: string | null
          id?: never
          purchased_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
          video_class_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_purchases_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_purchases_video_class_id_fkey"
            columns: ["video_class_id"]
            isOneToOne: false
            referencedRelation: "video_classes"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      user_can_manage_studio: {
        Args: { p_studio_id: number }
        Returns: boolean
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
