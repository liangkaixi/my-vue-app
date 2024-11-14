// schoolStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getOnliving } from '../service/onliving';
import  supabase  from '../utils/supabase';
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
    }

    return {
        schoolClasses,
        selectedGrade,
        loadSchoolClasses,
        setSelectedGrade,
    };
});
export const useClassDetailsStore = defineStore('classDetails', {
    state: () => ({
      classDetails: [],
      loading: false,
      error: null,
    }),
    actions: {
        async fetchClassDetails(classNames, month = 2) {
            this.loading = true;
            this.error = null;
          
            // Step 1: 获取 studentInfo 和 livingInfo
            const { data: studentData, error: studentError } = await supabase
                .from('studentInfo')
                .select(`*, livingInfo!inner(amount, feeAmount),manualPayments!left(paymentMethod, amount_charged) `)
                .eq('classNames', classNames)
                .eq('livingInfo.month', month);
          
            if (studentError) {
                console.error('Error fetching class details:', studentError);
                this.error = studentError;
                this.loading = false;
                return;
            }
        
            // Step 2: 从 schoolClass 获取 classId，再从 payCompleted 获取 living 状态
            const { data: schoolClassData, error: schoolClassError } = await supabase
                .from('schoolClass')
                .select('id')
                .eq('classNames', classNames)
                .single();
        
            if (schoolClassError || !schoolClassData) {
                console.error('Error fetching school class ID:', schoolClassError);
                this.error = schoolClassError;
                this.loading = false;
                return;
            }
        
            const { data: payCompletedData, error: payCompletedError } = await supabase
                .from('payCompleted')
                .select('living')
                .eq('classId', schoolClassData.id)
                .single();
        
            if (payCompletedError) {
                console.error('Error fetching payCompleted status:', payCompletedError);
                this.error = payCompletedError;
            }
        
            // 将 payCompleted 状态合并到结果中
            this.classDetails = studentData.map(student => ({
                ...student,
                payCompleted_living: payCompletedData?.living ?? false
            }));
            console.log('Class Details222:', this.classDetails);
            this.loading = false;
        },
        async fetchHeadTeacherTel(classNames) {
            const { data: teacherData, error: teacherError } = await supabase
                .from('teacherInfo')
                .select('tel, teacherNames')
                .eq('classNames', classNames)
                .eq('headTeachers', '班主任');
                
        
            if (teacherError || !teacherData) {
                console.error('Error fetching head teacher tel:', teacherError);
                this.error = teacherError;
                return null;
                console.log('Fetched head teacher data:', teacherData);
            }
        
            this.teacherTel = teacherData[0].tel;
            this.teacherNames = teacherData[0].teacherNames;
            return {
                tel: this.teacherTel, 
                name: this.teacherNames};
        },
      // 新增的更新学生就餐状态的方法
      async updateLivingState(studentId, newState) {
        const { data, error } = await supabase
            .from('studentInfo')
            .update({ livingState: newState })
            .eq('id', studentId);

        if (error) {
            console.error("Failed to update livingState:", error);
            return false;
        } else {
            console.log("Updated livingState successfully:", data);
            // 更新本地状态
            const student = this.classDetails.find(s => s.id === studentId);
            if (student) student.livingState = newState;
            return true;
        }
      },
      async updatePayCompletedLiveStatus(classId, newState) {
        const { data, error } = await supabase
            .from('payCompleted')
            .update({ living: newState })
            .eq('classId', classId);

        if (error) {
            console.error("Failed to update live status in payCompleted table:", error);
            return false;
        } else {
            console.log("Updated live status successfully in payCompleted table:", data);
            return true;
        }
    },
    async updatePayCompletedLiveStatusByClassName(classNames, newState) {
        // 获取 classId
        const { data: schoolClassData, error: schoolClassError } = await supabase
            .from('schoolClass')
            .select('id')
            .eq('classNames', classNames)
            .single();
    
        if (schoolClassError || !schoolClassData) {
            console.error('Error fetching school class ID for update:', schoolClassError);
            return false;
        }
    
        // 更新 payCompleted 表中的 living 状态
        const { data, error } = await supabase
            .from('payCompleted')
            .update({ living: newState })
            .eq('classId', schoolClassData.id);
    
        if (error) {
            console.error("Failed to update live status in payCompleted table:", error);
            return false;
        } else {
            console.log("Updated live status successfully in payCompleted table for classNames:", data);
            return true;
        }
    },
    async saveManualPayment(studentId, method, amount) {
        const month = 2;
        try {
            await supabase
                .from('manualPayments')
                .insert([
                    { student_id: studentId, paymentMethod: method, amount_charged: amount,month:month }
                ]);
        } catch (error) {
            console.error('Error saving manual payment:', error);
        }
    }
    },
  });