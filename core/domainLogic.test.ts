import { describe, it, expect } from 'vitest';
import {
    isSlotAvailable,
    createAppointmentObject,
    canClientCancel,
    updateTechScheduleWithBooking,
    validateReviewEligibility,
    calculateAverageRating,
    toggleSlotBlock
} from './domainLogic';
import { User, Technician, AppointmentStatus, DaySchedule, Appointment, Review, UserRole } from '../types';

describe('domainLogic', () => {
    describe('isSlotAvailable', () => {
        const schedule: DaySchedule[] = [{
            date: '2023-10-27',
            slots: [
                { id: '1', time: '10:00', isBooked: false, isBlocked: false },
                { id: '2', time: '11:00', isBooked: true, isBlocked: false },
                { id: '3', time: '12:00', isBooked: false, isBlocked: true },
            ]
        }];

        it('returns true if slot is free', () => {
            expect(isSlotAvailable(schedule, '2023-10-27', '10:00')).toBe(true);
        });

        it('returns false if slot is booked', () => {
            expect(isSlotAvailable(schedule, '2023-10-27', '11:00')).toBe(false);
        });

        it('returns false if slot is blocked', () => {
            expect(isSlotAvailable(schedule, '2023-10-27', '12:00')).toBe(false);
        });

        it('returns false if date not found', () => {
            expect(isSlotAvailable(schedule, '2023-10-28', '10:00')).toBe(false);
        });

        it('returns false if time not found', () => {
            expect(isSlotAvailable(schedule, '2023-10-27', '13:00')).toBe(false);
        });
    });

    describe('canClientCancel', () => {
        it('returns true if more than 24h before', () => {
            const now = new Date();
            const future = new Date(now.getTime() + 25 * 60 * 60 * 1000);
            const dateStr = future.toISOString().split('T')[0];
            const timeStr = future.toTimeString().slice(0, 5);
            expect(canClientCancel(dateStr, timeStr)).toBe(true);
        });

        it('returns false if less than 24h before', () => {
            const now = new Date();
            const future = new Date(now.getTime() + 23 * 60 * 60 * 1000);
            const dateStr = future.toISOString().split('T')[0];
            const timeStr = future.toTimeString().slice(0, 5);
            expect(canClientCancel(dateStr, timeStr)).toBe(false);
        });
    });

    describe('updateTechScheduleWithBooking', () => {
        it('updates slot booking status', () => {
            const schedule: DaySchedule[] = [{
                date: '2023-10-27',
                slots: [
                    { id: '1', time: '10:00', isBooked: false, isBlocked: false }
                ]
            }];

            const { updatedSchedules, updatedDay } = updateTechScheduleWithBooking(schedule, '2023-10-27', '10:00', true);

            expect(updatedSchedules[0].slots[0].isBooked).toBe(true);
            expect(updatedDay?.slots[0].isBooked).toBe(true);
            // Ensure immutability
            expect(schedule[0].slots[0].isBooked).toBe(false);
        });
    });

    describe('toggleSlotBlock', () => {
        it('toggles slot block status', () => {
             const schedule: DaySchedule[] = [{
                date: '2023-10-27',
                slots: [
                    { id: '1', time: '10:00', isBooked: false, isBlocked: false }
                ]
            }];

            const { updatedSchedules } = toggleSlotBlock(schedule, '2023-10-27', '10:00');
            expect(updatedSchedules[0].slots[0].isBlocked).toBe(true);

            const { updatedSchedules: updated2 } = toggleSlotBlock(updatedSchedules, '2023-10-27', '10:00');
            expect(updated2[0].slots[0].isBlocked).toBe(false);
        });
    });

    describe('validateReviewEligibility', () => {
        const currentUser = { id: 'client1' } as User;
        const techId = 'tech1';

        it('allows review if completed appointment exists and not yet reviewed', () => {
             const appointments = [{
                 id: '1', clientId: 'client1', techId: 'tech1', status: AppointmentStatus.COMPLETED
             }] as Appointment[];
             const reviews = [] as Review[];

             const result = validateReviewEligibility(appointments, reviews, currentUser.id, techId);
             expect(result.allowed).toBe(true);
        });

        it('denies review if no completed appointment', () => {
             const appointments = [{
                 id: '1', clientId: 'client1', techId: 'tech1', status: AppointmentStatus.CONFIRMED
             }] as Appointment[];
             const reviews = [] as Review[];

             const result = validateReviewEligibility(appointments, reviews, currentUser.id, techId);
             expect(result.allowed).toBe(false);
        });

        it('denies review if already reviewed', () => {
             const appointments = [{
                 id: '1', clientId: 'client1', techId: 'tech1', status: AppointmentStatus.COMPLETED
             }] as Appointment[];
             const reviews = [{
                 clientId: 'client1', techId: 'tech1'
             }] as Review[];

             const result = validateReviewEligibility(appointments, reviews, currentUser.id, techId);
             expect(result.allowed).toBe(false);
        });
    });

    describe('calculateAverageRating', () => {
        it('calculates correctly', () => {
            const reviews = [
                { rating: 5 }, { rating: 3 }
            ] as Review[];
            expect(calculateAverageRating(reviews)).toBe(4);
        });

        it('returns 0 for empty', () => {
            expect(calculateAverageRating([])).toBe(0);
        });
    });
});
