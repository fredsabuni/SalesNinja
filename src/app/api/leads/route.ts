/**
 * Leads API Route - Supabase integration
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
      console.log('Supabase not configured, returning mock data');
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const officerId = searchParams.get('officer_id');
    const isPublic = searchParams.get('public') === 'true';
    
    // Get dealer ID from request header (set by frontend)
    const dealerId = getDealerFromRequest(request) || searchParams.get('dealer_id');



    let query = supabase
      .from('leads')
      .select(`
        *,
        officer:officers(
          *,
          dealer:dealers(*)
        )
      `)
      .order('created_at', { ascending: false });

    // For public access (officers using main app), show all leads
    // For admin access, filter by dealer ID
    if (!isPublic && dealerId) {
      // First get officers for this dealer
      const { data: dealerOfficers } = await supabase
        .from('officers')
        .select('id')
        .eq('dealer_id', dealerId);
      
      if (dealerOfficers && dealerOfficers.length > 0) {
        const officerIds = dealerOfficers.map(o => o.id);
        query = query.in('officer_id', officerIds);
      } else {
        // No officers for this dealer, return empty
        return NextResponse.json([]);
      }
    } else if (!isPublic) {
      // Admin access without dealer ID, return empty
      return NextResponse.json([]);
    }

    // Filter by officer if provided
    if (officerId) {
      query = query.eq('officer_id', officerId);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch leads',
          message: 'Unable to load lead data from the database. Please try again.',
          code: 'LEADS_FETCH_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(leads || []);
    
  } catch (error) {
    console.error('Error in leads API:', error);
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

// POST endpoint for creating leads
export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    
    // Verify that the officer exists (no dealer validation needed for lead submission)
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .select('dealer_id')
      .eq('id', leadData.officer_id)
      .single();

    if (officerError || !officer) {
      return NextResponse.json(
        { 
          error: 'Invalid officer',
          message: 'Officer not found',
          code: 'INVALID_OFFICER'
        },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select(`
        *,
        officer:officers(
          *,
          dealer:dealers(*)
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create lead',
          message: 'Unable to save lead data to the database. Please check your information and try again.',
          code: 'LEAD_CREATE_ERROR'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create lead',
        message: 'An unexpected error occurred while saving the lead. Please try again.',
        code: 'LEAD_CREATE_UNEXPECTED_ERROR'
      },
      { status: 500 }
    );
  }
}