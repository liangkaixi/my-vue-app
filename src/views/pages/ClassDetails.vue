<template>
    <div>
        <h1>{{ classNames }} - 班级ID: {{ school_class_id }} 详情页面</h1>
        <!-- 这里展示其他详情信息 -->
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    classNames: String,
    school_class_id: [Number, String]
});
</script>
