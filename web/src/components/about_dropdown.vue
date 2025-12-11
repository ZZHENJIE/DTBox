<template>
    <NDropdown trigger="hover" :options="options">
        <NButton @click="$router.push('/about')">About</NButton>
    </NDropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";

const options = ref([
    {
        label: "Help",
        key: "help",
    },
    {
        label: "Version Beta 0.0.1",
        key: "version",
    },
]);
</script>
