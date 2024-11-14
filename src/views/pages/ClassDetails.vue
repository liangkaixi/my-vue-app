<template>
    <div class="p-6 bg-gray-100">
        <div class="flex">
            <h1 class="text-xl font-bold mb-6">{{ classNames }} 11月生活费缴费详情</h1>
            <div :class="['flex flex-col items-center justify-center rounded-border text-center cursor-pointer', pay_completed_living ? 'bg-green-100' : 'bg-red-100']"
                style="width: 5rem; height: 2rem" @click="togglePaymentStatus">
                <i :class="[iconColor, '!text-xl']"></i>
                <span class="mt-1 text-sm font-medium">
                    {{ pay_completed_living ? '结清√' : '暂未结清' }}
                </span>
            </div>
        </div>
        <!-- 班主任信息 -->
        <div v-if="teacher" class="mb-6 p-4 bg-white shadow rounded">
            <p class="text-lg font-medium">班主任: {{ teacherNameWithTitle }}</p>
            <p class="text-blue-500">
                电话: <a :href="'tel:' + teacher.tel">{{ teacher.tel }}</a>
            </p>
        </div>

        <div v-if="loading" class="text-lg text-center text-gray-500">
            数据加载中...
        </div>

        <div v-else>
            <!-- 已缴费人数及名单 -->
            <section v-if="paidNames.length" class="mb-4 p-4 bg-white shadow rounded">
                <h2 class="text-lg font-semibold mb-3">
                    总{{ total_count }}人，已缴费{{ paidNames.length }}人
                </h2>
                <div class="flex flex-wrap gap-2">
                    <div v-for="name in paidNames" :key="name.id"
                        class="px-3 py-1 bg-green-200 rounded cursor-pointer hover:bg-green-300"
                        @click="goToStudentDetail(name.id)">
                        {{ name.name }}
                    </div>
                </div>
            </section>

            <!-- 不就餐人数及名单 -->
            <section v-if="stateNoNames.length" class="mb-4 p-4 bg-white shadow rounded">
                <h2 class="text-lg font-semibold mb-3">不就餐 {{ stateNoNames.length }}人:</h2>
                <div class="flex flex-wrap gap-2">
                    <div v-for="name in stateNoNames" :key="name.id"
                        class="px-3 py-1 bg-yellow-200 rounded cursor-pointer hover:bg-yellow-300"
                        @click="goToStudentDetail(name.id)">
                        {{ name.name }}
                    </div>
                </div>
            </section>
            <!-- 代收人数及名单 -->
            <section v-if="manualNames.length" class="mb-4 p-4 bg-white shadow rounded">
                <h2 class="text-lg font-semibold mb-3">代收 {{ manualNames.length }}人,总计代收金额: {{ manuaReceivable }}元</h2>
                <div class="flex flex-wrap gap-2">
                    <div v-for="name in manualNames" :key="name.id"
                        class="px-3 py-1 bg-yellow-200 rounded cursor-pointer hover:bg-yellow-300"
                        @click="goToStudentDetail(name.id)">
                        {{ name.name }}:{{ name.manualPayments[0].amount_charged }} 元
                    </div>
                </div>
            </section>

            <!-- 未缴费人数及名单 -->
            <section v-if="pendingNames.length" class="mb-4 p-4 bg-white shadow rounded">
                <h2 class="text-lg font-semibold mb-3">11月生活费未缴费{{ pendingNames.length }}人, 总计欠缴金额: {{ totalReceivable
                    }}元</h2>
                <div class="flex flex-wrap gap-2">
                    <div v-for="person in pendingNames" :key="person.id"
                        class="px-3 py-1 bg-red-200 rounded cursor-pointer hover:bg-red-300"
                        @click="goToStudentDetail(person.id)">
                        {{ person.name }}:{{ person.receivable }} 元
                    </div>
                </div>
                <!-- 复制欠费信息按钮，居中显示 -->
                <div class="flex justify-center mt-4">
                    <button @click="copyPendingInfo"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700">
                        复制生活费欠费信息发送到群
                    </button>
                </div>
            </section>

            <!-- 当没有数据时显示提示 -->
            <div v-if="!paidNames.length && !stateNoNames.length && !pendingNames.length"
                class="text-lg text-center text-gray-500">
                暂无数据
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useClassDetailsStore } from '../../stores/schoolStore';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const classDetailsStore = useClassDetailsStore();
const loading = ref(true);
const total_count = ref(0);
const totalReceivable = ref(0);
const teacher = ref(null);
const manuaReceivable = ref(0);

const props = defineProps({
    classNames: String,
    school_class_id: [Number, String],
    classnumber: String,
    grade: String,
    iconColor: { type: String, default: 'text-gray-500' },
    pay_completed_living: Boolean,
    teacherNames: String,
    tel: String,
    name: String,
});
const pay_completed_living = computed(() => props.pay_completed_living);
// 根据条件获取不同名单
const paidNames = computed(() => classDetailsStore.classDetails.filter(student => student.livingInfo[0]?.feeAmount > 0));
const manualNames = computed(() => classDetailsStore.classDetails.filter(student => student.manualPayments.length > 0));
const stateNoNames = computed(() => classDetailsStore.classDetails.filter(student => student.livingState === false));
const pendingNames = computed(() =>
    classDetailsStore.classDetails
        .filter(student => student.livingInfo[0]?.feeAmount === 0 && student.livingState !== false && student.manualPayments.length === 0)
        .map(student => ({
            ...student,
            receivable: parseFloat(student.livingInfo[0]?.amount) || 0
        }))
);

watchEffect(() => {
    totalReceivable.value = pendingNames.value.reduce((total, student) => {
        return total + student.receivable;
    }, 0);
    manuaReceivable.value = manualNames.value.reduce((total, student) => {
        if (student.manualPayments && student.manualPayments.length > 0) {
            return total + (student.manualPayments[0].amount_charged || 0);  // 如果没有收费金额，默认 0
        }
        return total;
    }, 0);
});
// 加载数据
onMounted(async () => {
    await classDetailsStore.fetchClassDetails(props.classNames, 2);
    total_count.value = classDetailsStore.classDetails.length;
    loading.value = false;
    const teacherInfo = await classDetailsStore.fetchHeadTeacherTel(props.classNames);
    // 确保电话不为 null 或 undefined
    if (teacherInfo) {
        teacher.value = {
            name: teacherInfo.name,  // 如果有具体的教师姓名，也可以从返回的数据中取出
            tel: teacherInfo.tel
        };
    } else {
        console.warn('No teacher information available.');
    }
});

// 班主任的姓名和头衔
const teacherNameWithTitle = computed(() => `${teacher.value?.name.charAt(0)}老师`);

// 跳转到学生详情
function goToStudentDetail(studentId) {
    router.push({ name: 'StudentDetail', params: { studentId } });
}

// 复制欠费信息
function copyPendingInfo() {
    const message = pendingNames.value.map(student => `${student.name}: ${student.livingInfo[0]?.amount || 0}元`).join('\n');
    navigator.clipboard.writeText(`未缴费名单：\n${message}\n请尽快缴费`);
    alert("欠费信息已复制到剪贴板！");
}
async function togglePaymentStatus() {
    const password = prompt("请输入密码以更改缴费状态：");
    if (password === "zwc1234") {  // 替换为你的实际密码
        const newState = !pay_completed_living.value;

        // 调用 Pinia store 中的方法更新数据库
        const success = await classDetailsStore.updatePayCompletedLiveStatusByClassName(props.classNames, newState);

        if (success) {
            // 如果更新成功，同步更新本地的状态
            pay_completed_living.value = newState;
            alert("缴费状态已更新！");

            // 导航回班级详情页面
            router.push({ name: 'ClassDetails', params: { classNames: props.classNames, school_class_id: props.school_class_id } });
        } else {
            alert("更新缴费状态失败，请稍后重试。");
        }
    } else {
        alert("密码错误，无法更改缴费状态。");
    }
}
</script>
