import { Technician, UserRole, DaySchedule } from './types';

export const MOCK_TECHS: Technician[] = [
    {
        id: 't1',
        name: 'Carlos Silva',
        email: 'carlos@tecagenda.com',
        role: UserRole.TECHNICIAN,
        specialties: ['iPhone', 'Samsung', 'Troca de Tela'],
        rating: 4.8,
        distance: '1.2 km',
        priceEstimate: 'R$ 150 - R$ 400',
        bio: 'Especialista em reparos Apple com 5 anos de experiência. Atendimento rápido e garantido.',
        address: 'Rua das Flores, 123 - Centro',
        avatarUrl: 'https://picsum.photos/200/200?random=1'
    },
    {
        id: 't2',
        name: 'Ana Oliveira',
        email: 'ana@tecagenda.com',
        role: UserRole.TECHNICIAN,
        specialties: ['Motorola', 'Xiaomi', 'Bateria'],
        rating: 4.9,
        distance: '3.5 km',
        priceEstimate: 'R$ 100 - R$ 300',
        bio: 'Técnica certificada. Reparos de placa e troca de bateria em até 1 hora.',
        address: 'Av. Paulista, 500 - Sala 12',
        avatarUrl: 'https://picsum.photos/200/200?random=2'
    },
    {
        id: 't3',
        name: 'Roberto Santos',
        email: 'roberto@tecagenda.com',
        role: UserRole.TECHNICIAN,
        specialties: ['Software', 'Desbloqueio', 'Android'],
        rating: 4.5,
        distance: '5.0 km',
        priceEstimate: 'R$ 80 - R$ 200',
        bio: 'Recuperação de sistemas e limpeza de software. Seu celular novo de novo.',
        address: 'Rua Augusta, 800',
        avatarUrl: 'https://picsum.photos/200/200?random=3'
    }
];

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