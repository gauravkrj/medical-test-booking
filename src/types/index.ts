export enum TestType {
  HOME_TEST = 'HOME_TEST',
  CLINIC_TEST = 'CLINIC_TEST',
}

export enum BookingType {
  HOME_COLLECTION = 'HOME_COLLECTION',
  CLINIC_VISIT = 'CLINIC_VISIT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface Test {
  id: string
  name: string
  description?: string
  category: string
  price: number
  duration?: number
  testType: TestType
  isActive: boolean
  about?: string | null
  parameters?: string | null
  preparation?: string | null
  why?: string | null
  interpretations?: string | null
  faqsJson?: Array<{ question: string; answer: string }> | null
  createdAt?: string
  updatedAt?: string
}

export interface Booking {
  id: string
  userId: string
  bookingType: BookingType
  patientName: string
  patientAge: number
  bookingDate?: string | null
  bookingTime?: string | null
  address?: string | null
  city: string
  state?: string | null
  pincode?: string | null
  phone: string
  status: BookingStatus
  prescriptionUrl?: string | null
  notes?: string | null
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: BookingItem[]
  user?: User
}

export interface BookingItem {
  id: string
  bookingId: string
  testId: string
  price: number
  test?: Test
}

export interface User {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface SiteConfig {
  id: string
  labName: string
  labAddress: string
  labCity: string
  labState: string
  labPincode: string
  labPhone: string
  labEmail: string
  labLogoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  aboutText?: string | null
  termsText?: string | null
  privacyText?: string | null
}


