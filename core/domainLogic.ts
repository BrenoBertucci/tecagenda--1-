import { DaySchedule, Appointment, Review, Technician, User, AppointmentStatus, DaySlot } from '../types';

// --- BOOKING LOGIC ---

export const isSlotAvailable = (techSchedule: DaySchedule[], date: string, time: string): boolean => {
    const daySchedule = techSchedule.find(d => d.date === date);
    if (!daySchedule) return false;
    const slot = daySchedule.slots.find(s => s.time === time);
    return !!slot && !slot.isBooked && !slot.isBlocked;
};

export const createAppointmentObject = (
    currentUser: User,
    tech: Technician,
    date: string,
    time: string,
    model: string,
    issue: string
): Appointment => {
    return {
        id: Math.random().toString(36).substr(2, 9),
        clientId: currentUser.id,
        clientName: currentUser.name,
        techId: tech.id,
        techName: tech.name,
        date: date,
        time: time,
        deviceModel: model,
        issueDescription: issue,
        status: AppointmentStatus.CONFIRMED,
        createdAt: new Date().toISOString()
    };
};

// --- CANCELLATION LOGIC ---

export const canClientCancel = (dateStr: string, timeStr: string): boolean => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Month is 0-indexed in JS Date
    const aptDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    const diffMs = aptDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 24;
};

// --- SCHEDULE LOGIC ---

export const updateTechScheduleWithBooking = (
    techSchedule: DaySchedule[],
    date: string,
    time: string,
    isBooked: boolean
): { updatedSchedules: DaySchedule[], updatedDay: DaySchedule | null } => {
    // Clone the array to avoid mutation
    const newSchedule = [...techSchedule];
    const dayIndex = newSchedule.findIndex(d => d.date === date);
    let updatedDay: DaySchedule | null = null;

    if (dayIndex >= 0) {
        // Clone the day object
        const day = newSchedule[dayIndex];
        // Clone the slots array and the specific slot
        const newSlots = day.slots.map(slot =>
            slot.time === time ? { ...slot, isBooked: isBooked } : slot
        );

        newSchedule[dayIndex] = { ...day, slots: newSlots };
        updatedDay = newSchedule[dayIndex];
    }

    return { updatedSchedules: newSchedule, updatedDay };
};

export const toggleSlotBlock = (
    techSchedule: DaySchedule[],
    date: string,
    time: string
): { updatedSchedules: DaySchedule[], updatedDay: DaySchedule | null } => {
     const newSchedule = [...techSchedule];
     const dayIndex = newSchedule.findIndex(d => d.date === date);
     let updatedDay: DaySchedule | null = null;

     if (dayIndex >= 0) {
         const day = newSchedule[dayIndex];
         const newSlots = day.slots.map(slot =>
             slot.time === time ? { ...slot, isBlocked: !slot.isBlocked } : slot
         );
         newSchedule[dayIndex] = { ...day, slots: newSlots };
         updatedDay = newSchedule[dayIndex];
     }

     return { updatedSchedules: newSchedule, updatedDay };
};

// --- REVIEW LOGIC ---

export const validateReviewEligibility = (
    appointments: Appointment[],
    reviews: Review[],
    clientId: string,
    techId: string
): { allowed: boolean; reason?: string } => {
    // Check for at least one completed appointment
    const hasCompletedAppointment = appointments.some(
        apt => apt.clientId === clientId &&
            apt.techId === techId &&
            apt.status === AppointmentStatus.COMPLETED
    );

    if (!hasCompletedAppointment) {
        return { allowed: false, reason: 'Você só pode avaliar técnicos que já te atenderam.' };
    }

    // Check if already reviewed
    const alreadyReviewed = reviews.some(
        r => r.clientId === clientId && r.techId === techId
    );

    if (alreadyReviewed) {
        return { allowed: false, reason: 'Você já avaliou este técnico.' };
    }

    return { allowed: true };
};

export const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    // Return with 1 decimal place if needed, or just the number.
    // Usually storing as float is fine.
    return total / reviews.length;
};

export const createReviewObject = (
    currentUser: User,
    techId: string,
    rating: number,
    comment: string,
    tags: string[]
): Review => {
    return {
        id: Math.random().toString(36).substr(2, 9),
        clientId: currentUser.id,
        clientName: currentUser.name,
        techId: techId,
        rating,
        comment,
        tags,
        createdAt: new Date().toISOString()
    };
};
