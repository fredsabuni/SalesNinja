/**
 * Simple authentication for dealers
 */

import { supabase } from './supabase';
import { Dealer } from '@/types';

export interface AuthState {
  dealer: Dealer | null;
  loading: boolean;
}

// Normalize phone number to standard format
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    // 0714276444 -> 714276444 -> +255714276444
    cleaned = '255' + cleaned.substring(1);
  } else if (cleaned.startsWith('255')) {
    // 255714276444 -> +255714276444 (already correct)
    cleaned = cleaned;
  } else if (cleaned.length === 9) {
    // 714276444 -> +255714276444
    cleaned = '255' + cleaned;
  } else {
    // Default: assume it needs 255 prefix
    cleaned = '255' + cleaned;
  }
  
  return '+' + cleaned;
}

// Simple login with phone or email (no password for MVP)
export async function loginDealer(identifier: string): Promise<Dealer> {
  try {
    const cleanIdentifier = identifier.toLowerCase().trim();
    console.log('Login attempt with identifier:', cleanIdentifier);
    
    // Check if identifier looks like a phone number
    if (/[\d\+\-\s\(\)]/.test(cleanIdentifier)) {
      const normalizedPhone = normalizePhoneNumber(cleanIdentifier);
      console.log('Searching by phone:', normalizedPhone);
      
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();
        
      if (error || !data) {
        console.error('Phone search error:', error);
        throw new Error('Dealer not found');
      }
      
      console.log('Found dealer by phone:', data);
      localStorage.setItem('dealer', JSON.stringify(data));
      return data;
      
    } else {
      // Treat as email - try different approach
      console.log('Searching by email:', cleanIdentifier);
      
      // Try using filter instead of eq to avoid PostgREST issues
      const { data: dealers, error } = await supabase
        .from('dealers')
        .select('*')
        .filter('email', 'eq', cleanIdentifier);
        
      if (error) {
        console.error('Email search error:', error);
        throw new Error('Database error');
      }
      
      if (!dealers || dealers.length === 0) {
        console.log('No dealer found with email:', cleanIdentifier);
        throw new Error('Dealer not found');
      }
      
      const dealer = dealers[0];
      console.log('Found dealer by email:', dealer);
      localStorage.setItem('dealer', JSON.stringify(dealer));
      return dealer;
    }

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get current dealer from localStorage
export function getCurrentDealer(): Dealer | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('dealer');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Logout dealer
export function logoutDealer(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dealer');
  }
}

// Check if dealer is authenticated
export function isAuthenticated(): boolean {
  return getCurrentDealer() !== null;
}