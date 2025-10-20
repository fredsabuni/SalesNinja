import { Lead, Officer } from '@/types';

/**
 * Transform lead data to webhook payload format (simplified for MVP)
 */
export function transformLeadToWebhookPayload(
  lead: Lead,
  officer: Officer
) {
  return {
    officer: {
      id: officer.id,
      name: officer.name,
      phone: officer.phone,
      company: officer.dealer?.company || '',
    },
    lead: {
      name: lead.lead_name,
      phone: lead.phone_contact,
      residence: lead.residence,
      interestedProduct: lead.interested_phone_model,
      nextContactDate: lead.next_contact_date,
      areaOfActivity: lead.area_of_activity,
      ward: lead.ward,
      gpsCoordinates: (lead.gps_latitude && lead.gps_longitude)
        ? {
            lat: lead.gps_latitude,
            lng: lead.gps_longitude,
          }
        : undefined,
    },
    metadata: {
      collectedAt: lead.created_at,
      deviceInfo: getDeviceInfo(),
    },
  };
}

/**
 * Transform form data to Lead object for Supabase
 */
export function transformFormDataToLead(
  officerId: string,
  routeData: {
    areaOfActivity: string;
    ward: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  },
  leadData: {
    leadName: string;
    phoneContact: string;
    residence: string;
    interestedPhoneModel: string;
    nextContactDate: Date;
  }
) {
  // Ensure nextContactDate is a Date object and format it properly
  const nextContactDate = leadData.nextContactDate instanceof Date 
    ? leadData.nextContactDate 
    : new Date(leadData.nextContactDate);

  return {
    officer_id: officerId,
    area_of_activity: routeData.areaOfActivity,
    ward: routeData.ward,
    gps_latitude: routeData.gpsCoordinates?.latitude || null,
    gps_longitude: routeData.gpsCoordinates?.longitude || null,
    gps_accuracy: routeData.gpsCoordinates?.accuracy || null,
    lead_name: leadData.leadName,
    phone_contact: leadData.phoneContact,
    residence: leadData.residence,
    interested_phone_model: leadData.interestedPhoneModel,
    next_contact_date: nextContactDate.toISOString().split('T')[0],
  };
}

// Removed Notion-specific transformations as we're using Supabase

/**
 * Get device information for metadata
 */
function getDeviceInfo(): string {
  if (typeof navigator === 'undefined') {
    return 'Server';
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  // Extract browser info
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  return `${deviceType} - ${browser} - ${platform} - ${language}`;
}

/**
 * Sanitize phone number for storage and API calls
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + if it doesn't already
  if (!cleaned.startsWith('+') && cleaned.length > 0) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length >= 10) {
    // Format as +XXX XXX XXX XXX
    const countryCode = cleaned.slice(0, 3);
    const area = cleaned.slice(3, 6);
    const first = cleaned.slice(6, 9);
    const second = cleaned.slice(9, 12);
    
    return `+${countryCode} ${area} ${first} ${second}`.trim();
  }
  
  return phone;
}

/**
 * Validate GPS coordinates
 */
export function validateGPSCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Calculate distance between two GPS coordinates (in meters)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}