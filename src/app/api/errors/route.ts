/**
 * Error Reporting API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json();
    
    // Log the error report
    console.error('Error Report Received:', {
      id: errorReport.id,
      timestamp: errorReport.timestamp,
      severity: errorReport.severity,
      error: errorReport.error,
      context: errorReport.context,
      tags: errorReport.tags,
    });

    // In a production environment, you would:
    // 1. Validate the error report structure
    // 2. Store it in a database or send to an error tracking service
    // 3. Potentially trigger alerts for critical errors
    // 4. Aggregate error patterns for analysis

    // For now, we'll just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Error report received',
      reportId: errorReport.id 
    });
    
  } catch (error) {
    console.error('Failed to process error report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process error report' 
      },
      { status: 500 }
    );
  }
}