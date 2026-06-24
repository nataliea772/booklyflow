export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  imageUrl?: string;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Appointment = {
  id: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  adminNote?: string;
  createdAt: string;
  smsSentAt?: string;
  smsError?: string;
};

export type BusinessWorkingDay = {
  dayOfWeek: number;
  isOpen: boolean;
  startHour: string;
  endHour: string;
};

export type BlockedTime = {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isFullDay: boolean;
  reason?: string;
  createdAt: string;
};

export type CustomerReview = {
  id: string;
  appointmentId?: string;
  customerName: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: string;
};

export type BusinessGalleryImage = {
  id: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
};

export type BusinessSettings = {
  id?: string;
  businessName: string;
  workingHours: BusinessWorkingDay[];
  bufferMinutes: number;
  bookingWindowDays?: number;
  startHour: string;
  endHour: string;
  workingDays: number[];
  description?: string;
  phone?: string;
  whatsappPhone?: string;
  locationUrl?: string;
  wazeUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
};

export type GetAvailableSlotsParams = {
  selectedDate: string;
  selectedService: Service;
  appointments: Appointment[];
  businessSettings: BusinessSettings;
  blockedTimes?: BlockedTime[];
  excludeAppointmentId?: string;
  /** Grid step for slot starts; defaults to 30 minutes. */
  slotIntervalMinutes?: number;
  /** Earliest slot start on the selected day (e.g. hide past times when booking today). */
  minSlotStartTime?: string;
};
