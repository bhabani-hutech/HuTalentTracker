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
      candidates: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          experience: string | null
          file_url: string | null
          id: string
          job_id: string | null
          location: string | null
          match_score: number | null
          name: string
          notice_period: string | null
          phone: string | null
          skills: string | null
          source: string | null
          stage_id: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          experience?: string | null
          file_url?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          match_score?: number | null
          name: string
          notice_period?: string | null
          phone?: string | null
          skills?: string | null
          source?: string | null
          stage_id?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          experience?: string | null
          file_url?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          match_score?: number | null
          name?: string
          notice_period?: string | null
          phone?: string | null
          skills?: string | null
          source?: string | null
          stage_id?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          name: string
          signed_at: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          candidate_id: string | null
          comments: string | null
          communication_skills: number | null
          created_at: string | null
          cultural_fit: number | null
          experience_fit: number | null
          id: string
          improvements: string | null
          interview_id: string | null
          interviewer_id: string | null
          problem_solving: number | null
          recommendation: string | null
          strengths: string | null
          technical_skills: number | null
          updated_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          comments?: string | null
          communication_skills?: number | null
          created_at?: string | null
          cultural_fit?: number | null
          experience_fit?: number | null
          id?: string
          improvements?: string | null
          interview_id?: string | null
          interviewer_id?: string | null
          problem_solving?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          comments?: string | null
          communication_skills?: number | null
          created_at?: string | null
          cultural_fit?: number | null
          experience_fit?: number | null
          id?: string
          improvements?: string | null
          interview_id?: string | null
          interviewer_id?: string | null
          problem_solving?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          date: string
          feedback: string | null
          id: string
          interviewer_id: string | null
          rating: number | null
          status: Database["public"]["Enums"]["interview_status"] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          date: string
          feedback?: string | null
          id?: string
          interviewer_id?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          date?: string
          feedback?: string | null
          id?: string
          interviewer_id?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          created_by: string | null
          department: string
          description: string
          experience_max: number | null
          experience_min: number | null
          id: string
          interview_rounds: Json | null
          level: Database["public"]["Enums"]["job_level"]
          location: string
          openings: number | null
          requirements: string[]
          responsibilities: string[]
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          type: Database["public"]["Enums"]["job_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department: string
          description: string
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          interview_rounds?: Json | null
          level?: Database["public"]["Enums"]["job_level"]
          location: string
          openings?: number | null
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string
          description?: string
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          interview_rounds?: Json | null
          level?: Database["public"]["Enums"]["job_level"]
          location?: string
          openings?: number | null
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          country: string | null
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          departments: Json | null
          description: string | null
          email_domain: string | null
          id: number
          industry: string | null
          locations: Json | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          departments?: Json | null
          description?: string | null
          email_domain?: string | null
          id?: number
          industry?: string | null
          locations?: Json | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          departments?: Json | null
          description?: string | null
          email_domain?: string | null
          id?: number
          industry?: string | null
          locations?: Json | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          id: number
          name: string
          skill_order: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: number
          name: string
          skill_order: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: number
          name?: string
          skill_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      stages: {
        Row: {
          created_at: string
          description: string | null
          id: number
          stage: string
          stage_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          stage?: string
          stage_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          stage?: string
          stage_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          encrypted_password: string | null
          id: string
          is_active: boolean | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          encrypted_password?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          encrypted_password?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
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
      document_status: "Pending" | "Signed" | "Rejected" | "Expired"
      interview_status:
        | "Rejected in screening"
        | "Rejected -1"
        | "Rejected in -2"
        | "Cleared"
        | "HR round"
        | "Offered"
      job_level:
        | "Entry Level"
        | "Mid Level"
        | "Senior Level"
        | "Lead"
        | "Manager"
        | "Director"
      job_status: "Draft" | "Published" | "Closed" | "On Hold"
      job_type: "Full Time" | "Part Time" | "Contract" | "Internship"
      user_role: "Admin" | "HR" | "Hiring Manager" | "Interviewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
