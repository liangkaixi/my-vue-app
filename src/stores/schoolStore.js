// schoolStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getOnliving } from '../service/onliving';

export const useSchoolStore = defineStore('schoolStore', () => {
    const schoolClasses = ref([]);
    const selectedGrade = ref('一年级');

    async function loadSchoolClasses() {
        try {
            const data = await getOnliving();
            schoolClasses.value = data;
        } catch (error) {
            console.error('Failed to load school classes:', error);
        }
    }

    function setSelectedGrade(grade) {
        selectedGrade.value = grade;
        console.log('schoolStore - 设置的选中年级:', this.selectedGrade); // 检查 store 中的年级变化
    }

    return {
        schoolClasses,
        selectedGrade,
        loadSchoolClasses,
        setSelectedGrade,
    };
});
