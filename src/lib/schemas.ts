import { z } from 'zod';

// Officer validation schema
export const officerSchema = z.object({
  id: z.string().min(1, 'Officer ID is required'),
  name: z.string().min(1, 'Officer name is required'),
  office: z.string().min(1, 'Office is required'),
  department: z.string().min(1, 'Department is required'),
  region: z.string().min(1, 'Region is required'),
  notionId: z.string().min(1, 'Notion ID is required'),
});

// GPS coordinates schema
export const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  accuracy: z.number().positive('Accuracy must be positive'),
});

// Lead validation schema
export const leadSchema = z.object({
  id: z.string().min(1, 'Lead ID is required'),
  officerId: z.string().min(1, 'Officer ID is required'),
  officerName: z.string().min(1, 'Officer name is required'),
  
  // Route Information
  areaOfActivity: z.string().min(1, 'Area of activity is required'),
  ward: z.string().min(1, 'Ward is required'),
  gpsCoordinates: gpsCoordinatesSchema.optional(),
  
  // Lead Details
  leadName: z.string().min(1, 'Lead name is required'),
  phoneContact: z.string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^0\d{9}$/, 'Phone number must start with 0 and be 10 digits (e.g., 0712345678)'),
  residence: z.string().min(1, 'Residence is required'),
  interestedPhoneModel: z.string().min(1, 'Interested phone model is required'),
  nextContactDate: z.date().refine(
    (date) => date > new Date(),
    'Next contact date must be in the future'
  ),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  syncStatus: z.enum(['pending', 'synced', 'failed']),
  notionId: z.string().optional(),
});

// Form schemas for step-by-step validation
export const officerSelectionSchema = z.object({
  officerId: z.string().min(1, 'Please select an officer'),
});

export const routeInformationSchema = z.object({
  areaOfActivity: z.string().min(1, 'Area of activity is required'),
  ward: z.string().min(1, 'Ward is required'),
  gpsCoordinates: gpsCoordinatesSchema.optional(),
});

export const leadDetailsSchema = z.object({
  leadName: z.string().min(1, 'Lead name is required'),
  phoneContact: z.string()
    .length(10, 'Phone number must be exactly 10 digits')
    .regex(/^0\d{9}$/, 'Phone number must start with 0 and be 10 digits (e.g., 0712345678)'),
  residence: z.string().min(1, 'Residence is required'),
  interestedPhoneModel: z.string().min(1, 'Interested phone model is required'),
  nextContactDate: z.string()
    .min(1, 'Next contact date is required')
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return inputDate >= today;
      },
      'Next contact date must be today or in the future'
    ),
});

// API payload schemas
export const n8nLeadPayloadSchema = z.object({
  officer: z.object({
    id: z.string(),
    name: z.string(),
    office: z.string(),
  }),
  lead: z.object({
    name: z.string(),
    phone: z.string(),
    residence: z.string(),
    interestedProduct: z.string(),
    nextContactDate: z.string(),
    areaOfActivity: z.string(),
    ward: z.string(),
    gpsCoordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  metadata: z.object({
    collectedAt: z.string(),
    deviceInfo: z.string(),
  }),
});

// Sync queue item schema
export const syncQueueItemSchema = z.object({
  id: z.string(),
  type: z.enum(['lead', 'officer_refresh']),
  data: z.any(),
  attempts: z.number().min(0),
  lastAttempt: z.date().optional(),
  error: z.string().optional(),
});

// Error schema
export const appErrorSchema = z.object({
  type: z.enum([
    'network_error',
    'validation_error', 
    'storage_error',
    'api_error',
    'permission_error',
    'unknown_error'
  ]),
  message: z.string(),
  details: z.string().optional(),
  timestamp: z.date(),
});

// Samsung phone models for dropdown (phones only)
export const POPULAR_PHONE_MODELS = [
  // Galaxy S Series (Flagship)
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24+',
  'Samsung Galaxy S24',
  'Samsung Galaxy S23 Ultra',
  'Samsung Galaxy S23+',
  'Samsung Galaxy S23',
  'Samsung Galaxy S22 Ultra',
  'Samsung Galaxy S22+',
  'Samsung Galaxy S22',
  'Samsung Galaxy S21 Ultra',
  'Samsung Galaxy S21+',
  'Samsung Galaxy S21',
  
  // Galaxy A Series (Mid-range)
  'Samsung Galaxy A55 5G',
  'Samsung Galaxy A54 5G',
  'Samsung Galaxy A35 5G',
  'Samsung Galaxy A34 5G',
  'Samsung Galaxy A25 5G',
  'Samsung Galaxy A24',
  'Samsung Galaxy A15 5G',
  'Samsung Galaxy A14 5G',
  'Samsung Galaxy A05s',
  'Samsung Galaxy A05',
  
  // Galaxy M Series (Online-focused)
  'Samsung Galaxy M54 5G',
  'Samsung Galaxy M34 5G',
  'Samsung Galaxy M14 5G',
  
  // Galaxy F Series (Gaming-focused)
  'Samsung Galaxy F54 5G',
  'Samsung Galaxy F34 5G',
  'Samsung Galaxy F14 5G',
];

// Export type inference helpers
export type OfficerFormData = z.infer<typeof officerSelectionSchema>;
export type RouteFormData = z.infer<typeof routeInformationSchema>;
export type LeadDetailsFormData = z.input<typeof leadDetailsSchema>; // Use z.input to get the input type (before transform)
export type N8nLeadPayloadData = z.infer<typeof n8nLeadPayloadSchema>;
export type SyncQueueItemData = z.infer<typeof syncQueueItemSchema>;
export type AppErrorData = z.infer<typeof appErrorSchema>;