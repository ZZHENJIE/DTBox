<template>
    <NAutoComplete
        v-model:value="value"
        :input-props="{
            autocomplete: 'disabled',
        }"
        :options="options"
        placeholder="Tests"
        clearable
    ></NAutoComplete>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const valueRef = ref("");
const value = valueRef;
const options = computed(() => {
    return ["@gmail.com", "@163.com", "@qq.com"].map((suffix) => {
        const prefix = valueRef.value.split("@")[0];
        return {
            label: prefix + suffix,
            value: prefix + suffix,
        };
    });
});
</script>
