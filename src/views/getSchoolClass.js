import { getOnliving } from '../service/onliving';
export const getOnlivinges = async () => {
    const data = await getOnliving();
    if (!data) {
        console.error('Failed to fetch school classes');
    }
    return data;
};
