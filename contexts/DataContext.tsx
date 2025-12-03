import React, { createContext, useContext, useState, useEffect } from 'react';
import { DbUser, Appointment, Review, DaySchedule, UserRole } from '../types';
import { SupabaseService } from '../services/SupabaseService';
import { logService } from '../services/LogService';
import { useAuth } from './AuthContext';

interface DataContextType {
    usersDb: DbUser[];
    appointments: Appointment[];
    reviews: Review[];
    techSchedules: Record<string, DaySchedule[]>;
    refreshData: () => Promise<void>;
    loading: boolean;
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    setTechSchedules: React.Dispatch<React.SetStateAction<Record<string, DaySchedule[]>>>;
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    setUsersDb: React.Dispatch<React.SetStateAction<DbUser[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [usersDb, setUsersDb] = useState<DbUser[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [techSchedules, setTechSchedules] = useState<Record<string, DaySchedule[]>>({});
    const [loading, setLoading] = useState<boolean>(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [users, apts, revs, schedules] = await Promise.all([
                SupabaseService.getUsers(),
                SupabaseService.getAppointments(),
                SupabaseService.getReviews(),
                SupabaseService.getSchedules()
            ]);

            setUsersDb(users as DbUser[]);
            setAppointments(apts);
            setReviews(revs);
            setTechSchedules(schedules);

            logService.info('DATA_REFRESHED');
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        refreshData();
    }, []);

    return (
        <DataContext.Provider value={{
            usersDb,
            appointments,
            reviews,
            techSchedules,
            refreshData,
            loading,
            setAppointments,
            setTechSchedules,
            setReviews,
            setUsersDb
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
