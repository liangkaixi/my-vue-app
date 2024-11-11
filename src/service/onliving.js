import supabase from "../utils/supabase";
export const getOnliving = async () => {
    const { data:on_living_info, error } = await supabase.from('on_living_info').select('*').order('school_class_id', { ascending: true });
    if (error) {
        throw new Error(error.message);
    }
    return on_living_info;
};