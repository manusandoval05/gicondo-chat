export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Condominiums: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          condo_id: number
          content: string | null
          embedding: string | null
          id: number
        }
        Insert: {
          condo_id?: number
          content?: string | null
          embedding?: string | null
          id?: number
        }
        Update: {
          condo_id?: number
          content?: string | null
          embedding?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_condo_id_fkey"
            columns: ["condo_id"]
            referencedRelation: "Condominiums"
            referencedColumns: ["id"]
          }
        ]
      }
      UserInformation: {
        Row: {
          condominium: number | null
          department: string | null
          first_name: string | null
          last_name: string | null
          user_id: string
        }
        Insert: {
          condominium?: number | null
          department?: string | null
          first_name?: string | null
          last_name?: string | null
          user_id: string
        }
        Update: {
          condominium?: number | null
          department?: string | null
          first_name?: string | null
          last_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserInformation_condominium_fkey"
            columns: ["condominium"]
            referencedRelation: "Condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserInformation_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string
          similarity_threshold: number
          match_count: number
          condo_id: number
        }
        Returns: {
          id: number
          content: string
          similarity: number
          condo_id: number
        }[]
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

