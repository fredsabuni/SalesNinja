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
    let query = supabase.from('dealers').select('*');
    
    // Check if identifier looks like a phone number
    if (/[\d\+\-\s\(\)]/.test(identifier)) {
      const normalizedPhone = normalizePhoneNumber(identifier);
      query = query.eq('phone', normalizedPhone);
    } else {
      // Treat as email
      query = query.eq('email', identifier.toLowerCase().trim());
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new Error('Dealer not found');
    }

    // Store in localStorage for simple session management
    localStorage.setItem('dealer', JSON.stringify(data));
    
    return data;
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