<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4 text-xl">{{ title }} &nbsp;&nbsp; {{
                        student_count }}人</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium">就餐/不就餐:{{ value }}/{{ state_false }}
                    </div>
                </div>
                <div :class="['flex flex-col items-center justify-center rounded-border text-center', pay_completed_living ? 'bg-green-100' : 'bg-red-100']"
                    style="width: 2.5rem; height: 2.5rem">
                    <i :class="[iconColor, '!text-xl']"></i>
                    <span class="mt-1 text-sm font-medium">
                        {{ pay_completed_living ? '结清√' : '暂未结清' }}
                    </span>
                </div>

            </div>
            <span class="text-primary font-medium text-xl">{{ additionalInfo }}</span>
            <span class="text-muted-color">{{ description }}</span>
            <div class="mt-auto pt-4 flex justify-center">
                <Button label="详情" severity="secondary" @click="goToDetailPage" />
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps({
    title: String,
    student_count: Number,
    value: Number,
    state_false: Number,
    icon: String,
    iconBgColor: String,
    iconColor: String,
    additionalInfo: Number,
    pay_completed_living: Boolean,
    description: String,
    classNames: String,
    school_class_id: Number
});
const router = useRouter();

function goToDetailPage() {
    router.push({
        name: 'ClassDetails',
        params: {
            classNames: props.classNames,
            school_class_id: Number(props.school_class_id)
        }
    });
}
</script>
