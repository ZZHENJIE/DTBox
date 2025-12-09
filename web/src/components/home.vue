<template>
    <NLayout position="absolute" has-sider>
        <NLayout-sider
            content-style="padding: 24px;"
            :native-scrollbar="false"
            bordered
        >
            <n-h2 v-for="index in 20">{{ index }}-海淀桥</n-h2>
        </NLayout-sider>
        <NLayout content-style="padding: 24px;" :native-scrollbar="false">
            <n-h2 v-for="index in 20">{{ index }}-平山道</n-h2>
        </NLayout>
    </NLayout>
</template>
