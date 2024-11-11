import supabase  from '../utils/supabase';
export const getSchoolClass = async () => {
    const { data, error } = await supabase.from('schoolClass').select('*').order('id', { ascending: true });
    if (error) {
        throw new Error(error.message);
    }
    return data;
};
