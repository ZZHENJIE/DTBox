<template>
    <NLayout
        style="text-align: center"
        position="absolute"
        content-style="padding: 24px;"
    >
        <NIcon :size="100">
            <AlertCircleOutline></AlertCircleOutline>
        </NIcon>
        <br />
        <NText style="font-size: 40px">404 Not Found</NText>
    </NLayout>
</template>

<script setup lang="ts">
import { AlertCircleOutline } from "@vicons/ionicons5";
</script>
