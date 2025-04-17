export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          applied_date: string
          company: string
          cover_letter_id: string | null
          created_at: string
          follow_up_date: string | null
          id: string
          job_title: string
          notes: string | null
          resume_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_date: string
          company: string
          cover_letter_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          job_title: string
          notes?: string | null
          resume_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_date?: string
          company?: string
          cover_letter_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          job_title?: string
          notes?: string | null
          resume_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          company_name: string
          content: string
          created_at: string
          id: string
          job_description: string
          job_title: string
          resume_id: string
          user_id: string
        }
        Insert: {
          company_name: string
          content: string
          created_at?: string
          id?: string
          job_description: string
          job_title: string
          resume_id: string
          user_id: string
        }
        Update: {
          company_name?: string
          content?: string
          created_at?: string
          id?: string
          job_description?: string
          job_title?: string
          resume_id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_responses: {
        Row: {
          body_preview: string
          created_at: string
          id: string
          received_at: string
          sender: string
          subject: string
          user_id: string
        }
        Insert: {
          body_preview: string
          created_at?: string
          id?: string
          received_at?: string
          sender: string
          subject: string
          user_id: string
        }
        Update: {
          body_preview?: string
          created_at?: string
          id?: string
          received_at?: string
          sender?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      legend_points: {
        Row: {
          id: string
          last_updated: string
          total_points: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          total_points?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          total_points?: number
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          note: string | null
          reminder_time: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          reminder_time: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          reminder_time?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          created_at: string
          id: string
          job_description: string | null
          original_filename: string
          resume_id: string
          tweaked_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_description?: string | null
          original_filename: string
          resume_id: string
          tweaked_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_description?: string | null
          original_filename?: string
          resume_id?: string
          tweaked_text?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
