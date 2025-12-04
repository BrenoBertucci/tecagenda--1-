import { supabase } from './supabaseClient';
import { User, Technician, Appointment, Review, DaySchedule, UserRole, DbUser } from '../types';

export const SupabaseService = {
    // --- AUTH ---
    async signUp(email: string, password: string, userData: DbUser): Promise<User> {
        // Sign up with Supabase Auth - o trigger criará o usuário automaticamente
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: userData.name,
                    // role: userData.role, // REMOVED: Security risk - Role should be assigned by backend/trigger
                    avatar_url: userData.avatarUrl
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from signup');

        // Aguardar um pouco para o trigger criar o usuário
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            id: authData.user.id,
            email: authData.user.email!,
            name: userData.name,
            role: userData.role,
            avatarUrl: userData.avatarUrl,
            deletionRequested: false
        };
    },

    async signIn(email: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed');

        // Buscar perfil
        const profile = await this.getUserProfile(data.user.id);
        if (!profile) throw new Error('Profile not found');

        return profile;
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        try {
            return await this.getUserProfile(session.user.id);
        } catch (error) {
            console.error('Error fetching profile for session:', error);
            return null;
        }
    },

    async getUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .is('deleted_at', null)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        const baseUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            avatarUrl: data.avatar_url,
            deletionRequested: false
        };

        if (data.role === 'TECHNICIAN') {
            return {
                ...baseUser,
                specialties: data.specialties || [],
                rating: data.rating || 0,
                distance: data.distance || '',
                priceEstimate: data.price_estimate || '',
                bio: data.bio || '',
                address: data.address || ''
            } as Technician;
        }

        return baseUser;
    },

    // --- USERS ---
    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .is('deleted_at', null);

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return data.map((u: any) => {
            const baseUser: User = {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role as UserRole,
                avatarUrl: u.avatar_url,
                deletionRequested: false
            };

            if (u.role === 'TECHNICIAN') {
                return {
                    ...baseUser,
                    specialties: u.specialties || [],
                    rating: u.rating || 0,
                    distance: u.distance || '',
                    priceEstimate: u.price_estimate || '',
                    bio: u.bio || '',
                    address: u.address || ''
                } as Technician;
            }
            return baseUser;
        });
    },

    async updateUser(user: User | Technician): Promise<void> {
        const updates: any = {
            name: user.name,
            avatar_url: user.avatarUrl,
            updated_at: new Date().toISOString()
        };

        if (user.role === 'TECHNICIAN') {
            const tech = user as Technician;
            updates.bio = tech.bio;
            updates.address = tech.address;
            updates.specialties = tech.specialties;
            updates.price_estimate = tech.priceEstimate;
            updates.distance = tech.distance;
            updates.rating = tech.rating;
        }

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;
    },

    // --- APPOINTMENTS ---
    async getAppointments(): Promise<Appointment[]> {
        const { data, error } = await supabase
            .from('appointment_details')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }

        return data.map((a: any) => ({
            id: a.id,
            clientId: a.client_id,
            clientName: a.client_name,
            techId: a.tech_id,
            techName: a.tech_name,
            date: a.date,
            time: a.time,
            deviceModel: a.device_model,
            issueDescription: a.issue_description,
            status: a.status,
            createdAt: a.created_at
        }));
    },

    async createAppointment(apt: Appointment): Promise<void> {
        const { error } = await supabase
            .from('appointments')
            .insert({
                id: apt.id,
                client_id: apt.clientId,
                tech_id: apt.techId,
                client_name: apt.clientName,
                tech_name: apt.techName,
                date: apt.date,
                time: apt.time,
                device_model: apt.deviceModel,
                issue_description: apt.issueDescription,
                status: apt.status,
                created_at: apt.createdAt
            });

        if (error) throw error;
    },

    async updateAppointmentStatus(id: string, status: string, issueDescription?: string): Promise<void> {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };
        if (issueDescription) updateData.issue_description = issueDescription;

        const { error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
    },

    // --- REVIEWS ---
    async getReviews(): Promise<Review[]> {
        const { data, error } = await supabase
            .from('technician_reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        return data.map((r: any) => ({
            id: r.id,
            clientId: r.client_id,
            clientName: r.client_name,
            techId: r.tech_id,
            rating: r.rating,
            comment: r.comment,
            tags: r.tags || [],
            createdAt: r.created_at,
            reply: r.reply_text ? {
                text: r.reply_text,
                createdAt: r.reply_at
            } : undefined
        }));
    },

    async createReview(review: Review): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .insert({
                id: review.id,
                client_id: review.clientId,
                client_name: review.clientName,
                tech_id: review.techId,
                rating: review.rating,
                comment: review.comment,
                tags: review.tags,
                created_at: review.createdAt,
                reply_text: review.reply?.text,
                reply_at: review.reply?.createdAt
            });

        if (error) throw error;
    },

    async updateReview(review: Review): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .update({
                rating: review.rating,
                comment: review.comment,
                tags: review.tags,
                reply_text: review.reply?.text,
                reply_at: review.reply?.createdAt,
                updated_at: new Date().toISOString()
            })
            .eq('id', review.id);

        if (error) throw error;
    },

    async deleteReview(id: string): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    // --- SCHEDULES ---
    async getSchedules(): Promise<Record<string, DaySchedule[]>> {
        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .is('deleted_at', null);

        if (error) {
            console.error('Error fetching schedules:', error);
            return {};
        }

        const schedules: Record<string, DaySchedule[]> = {};

        data.forEach((s: any) => {
            if (!schedules[s.tech_id]) {
                schedules[s.tech_id] = [];
            }
            schedules[s.tech_id].push({
                date: s.date,
                slots: s.slots
            });
        });

        return schedules;
    },

    async updateSchedule(techId: string, daySchedule: DaySchedule): Promise<void> {
        const { error } = await supabase
            .from('schedules')
            .upsert({
                tech_id: techId,
                date: daySchedule.date,
                slots: daySchedule.slots,
                updated_at: new Date().toISOString()
            }, { onConflict: 'tech_id, date' });

        if (error) throw error;
    },

    // --- WEEKLY TEMPLATES ---
    async getWeeklyTemplate(techId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('weekly_templates')
            .select('*')
            .eq('tech_id', techId)
            .eq('is_active', true)
            .order('day_of_week');

        if (error) {
            console.error('Error fetching weekly template:', error);
            return [];
        }

        return data || [];
    },

    async saveWeeklyTemplate(techId: string, dayOfWeek: number, startTime: string, endTime: string): Promise<void> {
        const { error } = await supabase
            .from('weekly_templates')
            .upsert({
                tech_id: techId,
                day_of_week: dayOfWeek,
                start_time: startTime,
                end_time: endTime,
                is_active: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'tech_id,day_of_week' });

        if (error) throw error;
    },

    async deleteWeeklyTemplate(techId: string, dayOfWeek: number): Promise<void> {
        const { error } = await supabase
            .from('weekly_templates')
            .update({ is_active: false })
            .eq('tech_id', techId)
            .eq('day_of_week', dayOfWeek);

        if (error) throw error;
    },

    async createDefaultTemplate(techId: string): Promise<void> {
        const { error } = await supabase.rpc('create_default_commercial_template', {
            p_tech_id: techId
        });

        if (error) throw error;
    },

    // --- DAY BLOCKS ---
    async getDayBlocks(techId: string, startDate?: string, endDate?: string): Promise<any[]> {
        let query = supabase
            .from('day_blocks')
            .select('*')
            .eq('tech_id', techId)
            .order('block_date');

        if (startDate) {
            query = query.gte('block_date', startDate);
        }
        if (endDate) {
            query = query.lte('block_date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching day blocks:', error);
            return [];
        }

        return data || [];
    },

    async blockDay(techId: string, blockDate: string, reason?: string): Promise<void> {
        const { error } = await supabase
            .from('day_blocks')
            .insert({
                tech_id: techId,
                block_date: blockDate,
                reason: reason || null
            });

        if (error) throw error;
    },

    async unblockDay(techId: string, blockDate: string): Promise<void> {
        const { error } = await supabase
            .from('day_blocks')
            .delete()
            .eq('tech_id', techId)
            .eq('block_date', blockDate);

        if (error) throw error;
    },

    // --- SCHEDULE GENERATION ---
    async generateScheduleFromTemplate(techId: string, startDate?: string, daysAhead: number = 30): Promise<number> {
        const { data, error } = await supabase.rpc('generate_schedule_from_template', {
            p_tech_id: techId,
            p_start_date: startDate || new Date().toISOString().split('T')[0],
            p_days_ahead: daysAhead
        });

        if (error) {
            console.error('Error generating schedule:', error);
            throw error;
        }

        return data || 0;
    }
};
