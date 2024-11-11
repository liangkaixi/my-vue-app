<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ProductService } from '@/service/ProductService';
import { useSchoolStore } from '../stores/schoolStore';
import { onMounted, ref, watch, computed } from 'vue';
const { getPrimary, getSurface, isDarkTheme } = useLayout();
import StatCard from '@/components/StatCard.vue';
const schoolStore = useSchoolStore();
const products = ref(null);
const chartData = ref(null);
const chartOptions = ref(null);
const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-trash' }
]);
const filteredClasses = computed(() => {
    return schoolStore.schoolClasses.filter(
        (classItem) => classItem.grades === schoolStore.selectedGrade
    );
});
onMounted(async () => {
    try {
        await schoolStore.loadSchoolClasses();
        console.log('School classes loaded:', schoolStore.schoolClasses);
    } catch (err) {
        console.error('Error fetching school classes:', err);
    }
    ProductService.getProductsSmall().then((data) => (products.value = data));
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                type: 'bar',
                label: 'Subscriptions',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                data: [4000, 10000, 15000, 4000],
                barThickness: 32
            },
            {
                type: 'bar',
                label: 'Advertising',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                data: [2100, 8400, 2400, 7500],
                barThickness: 32
            },
            {
                type: 'bar',
                label: 'Affiliate',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                data: [4100, 5200, 3400, 7400],
                borderRadius: {
                    topLeft: 8,
                    topRight: 8
                },
                borderSkipped: true,
                barThickness: 32
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatCard v-for="schoolClass in filteredClasses" :key="schoolClass.id" :title="schoolClass.classNames"
            :student_count="schoolClass.student_count" :value="schoolClass.living_state_true_count"
            :state_false="schoolClass.living_state_false_count" icon="pi pi-users"
            iconBgColor="bg-cyan-100 dark:bg-cyan-400/10" iconColor="text-cyan-500"
            :additionalInfo="schoolClass.fee_count" description=" 人已缴费"
            :pay_completed_living="schoolClass.pay_completed_living" :classNames="schoolClass.classNames"
            :school_class_id="Number(schoolClass.school_class_id)" />
    </div>
</template>
