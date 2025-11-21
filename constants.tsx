import { Technician, UserRole, DaySchedule } from './types';

// No mock technicians - empty array
export const MOCK_TECHS: Technician[] = [];

// Generate next 3 days schedules
export const generateMockSchedule = (daysOffset: number = 3): DaySchedule[] => {
    const schedules: DaySchedule[] = [];
    const today = new Date();

    for (let i = 0; i < daysOffset; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        schedules.push({
            date: dateStr,
            slots: [
                { id: `${dateStr}-09`, time: '09:00', isBlocked: false, isBooked: false },
                { id: `${dateStr}-10`, time: '10:00', isBlocked: false, isBooked: i === 0 }, // First day 10am booked
                { id: `${dateStr}-11`, time: '11:00', isBlocked: false, isBooked: false },
                { id: `${dateStr}-14`, time: '14:00', isBlocked: true, isBooked: false }, // Blocked (Lunch/Busy)
                { id: `${dateStr}-15`, time: '15:00', isBlocked: false, isBooked: false },
                { id: `${dateStr}-16`, time: '16:00', isBlocked: false, isBooked: false },
            ]
        });
    }
    return schedules;
};

export const SERVICE_TAGS = [
    'Rápido',
    'Preço Justo',
    'Atencioso',
    'Profissional',
    'Pontual',
    'Serviço de Qualidade',
    'Honesto',
    'Ambiente Agradável'
];