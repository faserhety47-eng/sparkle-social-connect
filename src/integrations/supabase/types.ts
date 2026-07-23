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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          amount_rub: number
          created_at: string
          created_by: string | null
          id: string
          kind: string
          note: string | null
          order_id: string | null
          user_id: string
        }
        Insert: {
          amount_rub: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          note?: string | null
          order_id?: string | null
          user_id: string
        }
        Update: {
          amount_rub?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          note?: string | null
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          location: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          location: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          location?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          order_id: string
          read_at: string | null
          sender: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          order_id: string
          read_at?: string | null
          sender: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          order_id?: string
          read_at?: string | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          external_order_id: number | null
          external_service_id: number | null
          external_status: string | null
          guest_contact: string | null
          guest_email: string | null
          guest_token: string | null
          id: string
          link: string
          payment_note: string | null
          platform: string
          price_rub: number
          quantity: number
          refunded: boolean
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          external_order_id?: number | null
          external_service_id?: number | null
          external_status?: string | null
          guest_contact?: string | null
          guest_email?: string | null
          guest_token?: string | null
          id?: string
          link: string
          payment_note?: string | null
          platform: string
          price_rub: number
          quantity: number
          refunded?: boolean
          service_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          external_order_id?: number | null
          external_service_id?: number | null
          external_status?: string | null
          guest_contact?: string | null
          guest_email?: string | null
          guest_token?: string | null
          id?: string
          link?: string
          payment_note?: string | null
          platform?: string
          price_rub?: number
          quantity?: number
          refunded?: boolean
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          details: string | null
          id: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      platforms: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon_emoji: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          letter: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id: string
          is_active?: boolean
          letter?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          letter?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance_rub: number
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          balance_rub?: number
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          balance_rub?: number
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          note: string | null
          updated_at: string
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          note?: string | null
          updated_at?: string
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          note?: string | null
          updated_at?: string
          uses?: number
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          created_at: string
          discount_rub: number
          id: string
          order_id: string | null
          promo_code_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_rub: number
          id?: string
          order_id?: string | null
          promo_code_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_rub?: number
          id?: string
          order_id?: string | null
          promo_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          created_at: string
          id: string
          platform: string
          price_per_unit: number
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          price_per_unit?: number
          service_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          price_per_unit?: number
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content_md: string
          created_at: string
          description: string | null
          id: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content_md?: string
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content_md?: string
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      smm_services: {
        Row: {
          active: boolean
          api_platform: string
          category: string
          created_at: string
          description: string | null
          id: number
          max_qty: number
          min_qty: number
          name: string
          platform: string
          price_api: number
          price_rub: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          api_platform: string
          category: string
          created_at?: string
          description?: string | null
          id: number
          max_qty?: number
          min_qty?: number
          name: string
          platform: string
          price_api: number
          price_rub: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          api_platform?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: number
          max_qty?: number
          min_qty?: number
          name?: string
          platform?: string
          price_api?: number
          price_rub?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          from_admin: boolean
          id: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          from_admin?: boolean
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          from_admin?: boolean
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          admin_unread: boolean
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
          user_unread: boolean
        }
        Insert: {
          admin_unread?: boolean
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
          user_unread?: boolean
        }
        Update: {
          admin_unread?: boolean
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          user_unread?: boolean
        }
        Relationships: []
      }
      topup_payments: {
        Row: {
          amount_rub: number
          created_at: string
          credited: boolean
          id: string
          kind: string
          order_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          yookassa_payment_id: string | null
        }
        Insert: {
          amount_rub: number
          created_at?: string
          credited?: boolean
          id?: string
          kind?: string
          order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          yookassa_payment_id?: string | null
        }
        Update: {
          amount_rub?: number
          created_at?: string
          credited?: boolean
          id?: string
          kind?: string
          order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          yookassa_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topup_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      admin_topup_balance: {
        Args: { _amount: number; _note?: string; _user_id: string }
        Returns: undefined
      }
      admin_upsert_smm_service: {
        Args: {
          _api_platform: string
          _category: string
          _description: string
          _id: number
          _max: number
          _min: number
          _name: string
          _platform: string
          _price_api: number
          _price_rub: number
        }
        Returns: undefined
      }
      attach_yookassa_payment: {
        Args: { _payment_id: string; _status: string; _topup_id: string }
        Returns: undefined
      }
      charge_and_create_smm_order: {
        Args: { _link: string; _quantity: number; _service_id: number }
        Returns: string
      }
      client_guest_token: { Args: never; Returns: string }
      create_account_yookassa_topup: {
        Args: { _amount: number }
        Returns: string
      }
      create_guest_smm_order: {
        Args: {
          _contact: string
          _email: string
          _link: string
          _quantity: number
          _service_id: number
        }
        Returns: {
          amount: number
          guest_token: string
          order_id: string
        }[]
      }
      create_guest_yookassa_payment: {
        Args: {
          _contact: string
          _email: string
          _link: string
          _quantity: number
          _service_id: number
        }
        Returns: {
          amount: number
          guest_token: string
          order_id: string
          topup_id: string
        }[]
      }
      credit_yookassa_topup: {
        Args: { _payment_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_guest_smm_order_error: {
        Args: { _message: string; _order_id: string }
        Returns: undefined
      }
      mark_guest_smm_order_started: {
        Args: { _external_order_id: number; _order_id: string }
        Returns: undefined
      }
      pay_order_from_balance: {
        Args: { _order_id: string }
        Returns: undefined
      }
      process_yookassa_verified: {
        Args: { _paid: boolean; _payment_id: string; _status: string }
        Returns: {
          needs_smm: boolean
          payment_kind: string
          related_order_id: string
          smm_link: string
          smm_quantity: number
          smm_service_id: number
        }[]
      }
      redeem_promo: {
        Args: { _code: string; _order_price: number }
        Returns: Json
      }
      refund_smm_order: {
        Args: { _order_id: string; _reason: string }
        Returns: undefined
      }
      sync_guest_smm_status: {
        Args: {
          _external_status: string
          _guest_token: string
          _local_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
