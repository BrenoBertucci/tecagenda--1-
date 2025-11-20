export enum UserRole {
    CLIENT = 'CLIENT',
    TECHNICIAN = 'TECHNICIAN'
}

export enum AppointmentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface Technician extends User {
    specialties: string[];
    rating: number;
    distance: string; // Mocked for display
    priceEstimate: string;
    bio: string;
    address: string;
}

export interface TimeSlot {
    id: string;
    time: string; // e.g., "09:00"
    isBlocked: boolean;
    isBooked: boolean;
}

export interface DaySchedule {
    date: string; // ISO Date string YYYY-MM-DD
    slots: TimeSlot[];
}

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    techId: string;
    techName: string;
    date: string;
    time: string;
    deviceModel: string;
    issueDescription: string;
    status: AppointmentStatus;
    createdAt: string;
}

export interface Review {
    id: string;
    clientId: string;
    clientName: string;
    techId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}