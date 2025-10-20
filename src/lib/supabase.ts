/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      dealers: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          updated_at?: string;
        };
      };
      officers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          dealer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          dealer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          dealer_id?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          officer_id: string;
          area_of_activity: string;
          ward: string;
          gps_latitude: number | null;
          gps_longitude: number | null;
          gps_accuracy: number | null;
          lead_name: string;
          phone_contact: string;
          residence: string;
          interested_phone_model: string;
          next_contact_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          officer_id: string;
          area_of_activity: string;
          ward: string;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          gps_accuracy?: number | null;
          lead_name: string;
          phone_contact: string;
          residence: string;
          interested_phone_model: string;
          next_contact_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          officer_id?: string;
          area_of_activity?: string;
          ward?: string;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          gps_accuracy?: number | null;
          lead_name?: string;
          phone_contact?: string;
          residence?: string;
          interested_phone_model?: string;
          next_contact_date?: string;
          updated_at?: string;
        };
      };
    };
  };
}