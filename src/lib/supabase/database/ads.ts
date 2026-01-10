import { supabase } from '../client';

export interface Ad {
    id: string;
    title: string;
    content: string;
    type: 'image' | 'video';
    status: 'active' | 'inactive' | 'pending' | 'scheduled';
    start_date: string | null;
    end_date: string | null;
    phone?: string;
    location?: string;
    description?: string;
    tags?: string[];
    area?: string;
    city?: string[];
    pet_type?: string;
    breed?: string;
    age_range?: string[];
    weight?: string[];
    views: number;
    clicks: number;
    duration?: number;
    image_url?: string;
    created_at: string;
}

// Get ad by ID
export async function getAdById(id: string): Promise<Ad | null> {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching ad:', error);
        return null;
    }

    return data;
}

// Get all active ads
export async function getActiveAds(): Promise<Ad[]> {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active ads:', error);
        return [];
    }

    return data || [];
}
