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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity: string
          entity_id: string
          id: string
          meta: Json
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          meta?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          emoji: string
          key: string
          name_ar: string
          name_en: string
          name_fr: string
        }
        Insert: {
          emoji?: string
          key: string
          name_ar: string
          name_en?: string
          name_fr?: string
        }
        Update: {
          emoji?: string
          key?: string
          name_ar?: string
          name_en?: string
          name_fr?: string
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string
          capacity: number
          category: string | null
          commune: string
          contact: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          desc_ar: string
          desc_en: string
          desc_fr: string
          end_at: string | null
          hours: number
          id: string
          maps_url: string | null
          organizer: string
          points: number
          start_at: string | null
          status: string
          title_ar: string
          title_en: string
          title_fr: string
          wilaya: number
          xp: number
        }
        Insert: {
          address?: string
          capacity?: number
          category?: string | null
          commune?: string
          contact?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          desc_ar?: string
          desc_en?: string
          desc_fr?: string
          end_at?: string | null
          hours?: number
          id?: string
          maps_url?: string | null
          organizer?: string
          points?: number
          start_at?: string | null
          status?: string
          title_ar: string
          title_en?: string
          title_fr?: string
          wilaya: number
          xp?: number
        }
        Update: {
          address?: string
          capacity?: number
          category?: string | null
          commune?: string
          contact?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          desc_ar?: string
          desc_en?: string
          desc_fr?: string
          end_at?: string | null
          hours?: number
          id?: string
          maps_url?: string | null
          organizer?: string
          points?: number
          start_at?: string | null
          status?: string
          title_ar?: string
          title_en?: string
          title_fr?: string
          wilaya?: number
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["key"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      participations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          hours: number
          id: string
          points: number
          submission_id: string | null
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: string
          points?: number
          submission_id?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          points?: number
          submission_id?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          commune: string | null
          created_at: string
          display_name: string
          hours: number
          id: string
          points: number
          status: string
          verified: boolean
          wilaya: number | null
          xp: number
        }
        Insert: {
          commune?: string | null
          created_at?: string
          display_name?: string
          hours?: number
          id: string
          points?: number
          status?: string
          verified?: boolean
          wilaya?: number | null
          xp?: number
        }
        Update: {
          commune?: string | null
          created_at?: string
          display_name?: string
          hours?: number
          id?: string
          points?: number
          status?: string
          verified?: boolean
          wilaya?: number | null
          xp?: number
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          cost: number
          created_at: string
          id: string
          reward_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          reward_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          reward_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cost: number
          emoji: string
          id: string
          partner: string
          stock: number
          title: string
        }
        Insert: {
          active?: boolean
          cost?: number
          emoji?: string
          id?: string
          partner?: string
          stock?: number
          title: string
        }
        Update: {
          active?: boolean
          cost?: number
          emoji?: string
          id?: string
          partner?: string
          stock?: number
          title?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          media: string[]
          note: string
          participation_id: string | null
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          media?: string[]
          note?: string
          participation_id?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          media?: string[]
          note?: string
          participation_id?: string | null
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "participations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_registrations: {
        Row: {
          ai_review: Json | null
          commune: string
          created_at: string
          education: string
          first_name: string
          free_days: string[]
          gender: string
          id: string
          id_card_path: string
          last_name: string
          phone: string
          user_id: string
          wilaya: number
          work_type: string
        }
        Insert: {
          ai_review?: Json | null
          commune: string
          created_at?: string
          education: string
          first_name: string
          free_days?: string[]
          gender: string
          id?: string
          id_card_path: string
          last_name: string
          phone: string
          user_id: string
          wilaya: number
          work_type: string
        }
        Update: {
          ai_review?: Json | null
          commune?: string
          created_at?: string
          education?: string
          first_name?: string
          free_days?: string[]
          gender?: string
          id?: string
          id_card_path?: string
          last_name?: string
          phone?: string
          user_id?: string
          wilaya?: number
          work_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "event_manager" | "moderator"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "admin", "event_manager", "moderator"],
    },
  },
} as const
