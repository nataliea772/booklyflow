export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

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
  createdAt: string;
};

export type BusinessSettings = {
  businessName: string;
  startHour: string;
  endHour: string;
  bufferMinutes: number;
  workingDays: number[];
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
};
