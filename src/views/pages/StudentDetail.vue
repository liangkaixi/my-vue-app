<template>
    <div class="p-6 bg-gray-100">
        <h1 class="text-xl font-bold mb-4">{{ student?.name }} 的详细信息</h1>
        <div v-if="student" class="bg-white shadow rounded p-4 mb-4">
            <p><strong>班级:</strong> {{ student.classNames }}</p>
            <p><strong>联系电话1:</strong>
                <a :href="'tel:' + student.tel_1" class="text-blue-500 hover:text-blue-700">
                    {{ student.tel_1 }}
                </a>
            </p>
            <p><strong>联系电话2:</strong>
                <a :href="'tel:' + student.tel_2" class="text-blue-500 hover:text-blue-700">
                    {{ student.tel_2 }}
                </a>
            </p>

            <!-- 就餐状态选择框 -->
            <div class="flex items-center space-x-4">
                <strong>就餐状态:</strong>
                <div>
                    <Select v-model="student.livingState" :options="states" optionLabel="name" optionValue="value"
                        size="small" class="w-full md:w-25" @change="handleLivingStateChange" />
                </div>
            </div>

            <!-- 根据就餐状态来显示/隐藏生活费和缴费状态 -->
            <div v-if="student.livingState" class="mt-4">
                <p><strong>生活费:</strong> {{ student.livingInfo[0]?.amount || '0' }} 元</p>

                <!-- 判断是否已代收 -->
                <p><strong>缴费状态:</strong>
                    <span v-if="student.manualPayments.length > 0">已代收</span>
                    <span v-else>{{ student.livingInfo[0]?.feeAmount > 0 ? '已缴费' : '未缴费' }}</span>
                </p>

                <!-- 代收金额 -->
                <p v-if="student.manualPayments.length > 0"><strong>代收金额:</strong>
                    {{ student.manualPayments[0]?.amount_charged || '0' }} 元
                </p>

                <!-- 如果未缴费，显示补交方式选择框和金额输入框 -->
                <div v-if="student.manualPayments.length === 0 && student.livingInfo?.length > 0 && student.livingInfo[0]?.feeAmount <= 0"
                    class="mt-4">
                    <!-- 补交方式选择框 -->
                    <label for="paymentMethod"><strong>补交方式：</strong></label>
                    <Select v-model="paymentMethod" :options="paymentMethods" optionLabel="name" optionValue="value"
                        size="small" class="w-25 md:w-25" />

                    <!-- 补交金额输入框 -->
                    <div class="mt-4">
                        <label for="paymentAmount"><strong>补交金额：</strong></label>
                        <InputText id="paymentAmount" v-model="paymentAmount" placeholder="请输入金额" class="w-25 md:w-25"
                            :disabled="!paymentMethod" :value="student.livingInfo[0].amount" />
                    </div>

                    <!-- 提交按钮 -->
                    <div class="mt-4">
                        <Button label="提交" icon="pi pi-check" class="w-25 md:w-25" :disabled="isSubmitButtonDisabled"
                            @click="handleSubmit" />
                    </div>
                </div>
            </div>

        </div>

        <div v-else class="text-center text-gray-500">数据加载中...</div>
    </div>
</template>

<script setup>
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { computed, onMounted, ref, watch } from 'vue';
import { useClassDetailsStore } from '../../stores/schoolStore';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const classDetailsStore = useClassDetailsStore();

// 获取当前学生 ID
const studentId = parseInt(route.params.studentId);

// 就餐状态选项
const states = ref([
    { name: '在校', value: true },
    { name: '不在校', value: false }
]);
const paymentMethods = ref([
    { name: '现金', value: 'cash' },
    { name: '微信', value: 'wechat' }
]);
const paymentMethod = ref('wechat');


// 控制按钮是否正在提交
const isSubmitting = ref(false);
// 提交补交支付信息
const handleSubmit = async () => {
    if (paymentMethod.value && paymentAmount.value && !isSubmitting.value) {
        try {
            // 设置正在提交状态，禁用按钮
            isSubmitting.value = true;
            // 调用 saveManualPayment 函数，将补交信息保存到 Supabase
            await saveManualPayment(studentId, paymentMethod.value, paymentAmount.value);
            // 提交成功后返回上一页
            router.back();

            // 清除提交状态（如果需要）
            isSubmitting.value = false;

        } catch (error) {
            console.error('提交补交信息时出错:', error.message);
            // 出现错误时，恢复按钮的状态
            isSubmitting.value = false;
        }
    }
};
const sortedStudents = ref([]);
// 数据加载和状态初始化
onMounted(async () => {
    // 若 classDetails 为空，重新获取数据
    if (classDetailsStore.classDetails.length === 0) {
        await classDetailsStore.fetchClassDetails(route.params.classNames, 2);
    }
    sortStudents();
});

const sortStudents = () => {
    sortedStudents.value = classDetailsStore.classDetails
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { sensitivity: 'base' }));// Log sorted result
};
// 计算属性：获取当前学生信息
const student = computed(() => sortedStudents.value.find(s => s.id === studentId));
const isSubmitButtonDisabled = computed(() => false);  // Always returns false, so button is never disabled

const handleLivingStateChange = () => {
    classDetailsStore.updateLivingState(studentId, student.value.livingState);
    router.back();
};

const { loading, error, success, saveManualPayment } = classDetailsStore;
</script>
