export enum UserRole {
    CLIENT = 'CLIENT',
    TECHNICIAN = 'TECHNICIAN',
    ADMIN = 'ADMIN'
}

export enum AppointmentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
    DISPUTED = 'DISPUTED'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    deletionRequested?: boolean;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    userId?: string;
    userName?: string;
    details?: string;
}

export enum LogLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL'
}

export interface StructuredLog {
    id: string;
    timestamp: string;
    level: LogLevel;
    action: string;
    userId?: string;
    userEmail?: string; // Anonymized
    details?: Record<string, any>;
    encrypted: boolean;
    hash?: string; // Integrity check
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
    tags?: string[];
    reply?: {
        text: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt?: string;
}

export interface DbUser extends User {
    password?: string;
    specialties?: string[];
    rating?: number;
    distance?: string;
    priceEstimate?: string;
    bio?: string;
    address?: string;
}