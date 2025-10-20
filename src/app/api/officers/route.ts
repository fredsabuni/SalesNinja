/**
 * Officers API Route - Supabase integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to get dealer from request headers
function getDealerFromRequest(request: NextRequest): string | null {
  const dealerHeader = request.headers.get('x-dealer-id');
  return dealerHeader;
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      console.log('Supabase not configured, returning mock officers');
      // Return some mock officers for development
      return NextResponse.json([
        { id: '1', name: 'John Doe', phone: '+255714276444', dealer_id: 'mock-dealer' },
        { id: '2', name: 'Jane Smith', phone: '+255714276445', dealer_id: 'mock-dealer' }
      ]);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const isPublic = searchParams.get('public') === 'true';
    
    // Get dealer ID from request header (set by frontend)
    const dealerId = getDealerFromRequest(request) || searchParams.get('dealer_id');



    let query = supabase
      .from('officers')
      .select(`
        *,
        dealer:dealers(*)
      `);

    // For public access (officers using main app), show all officers
    // For admin access, filter by dealer ID
    if (!isPublic) {
      if (dealerId) {
        query = query.eq('dealer_id', dealerId);
      } else {
        // If no dealer ID provided for admin access, return empty array
        return NextResponse.json([]);
      }
    }

    const { data: officers, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch officers',
          message: 'Unable to load officer data from the database. Please try again.',
          code: 'OFFICERS_FETCH_ERROR'
        },
        { status: 500 }
      );
    }

    // Filter by search query if provided
    let filteredOfficers = officers || [];
    if (search) {
      filteredOfficers = officers?.filter(officer =>
        officer.name.toLowerCase().includes(search) ||
        officer.phone.toLowerCase().includes(search)
      ) || [];
    }

    return NextResponse.json(filteredOfficers);
    
  } catch (error) {
    console.error('Error in officers API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating officers
export async function POST(request: NextRequest) {
  try {
    const { name, phone, dealer_id } = await request.json();
    
    const { data, error } = await supabase
      .from('officers')
      .insert([{ name, phone, dealer_id }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create officer',
          message: 'Unable to save officer data to the database. Please check your information and try again.',
          code: 'OFFICER_CREATE_ERROR'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error creating officer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create officer',
        message: 'An unexpected error occurred while creating the officer. Please try again.',
        code: 'OFFICER_CREATE_UNEXPECTED_ERROR'
      },
      { status: 500 }
    );
  }
}