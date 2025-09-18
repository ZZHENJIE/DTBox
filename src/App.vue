<template>
    <NConfigProvider inlineThemeDisabled>
        <NLayout position='absolute'>
            <!-- 添加 z-index 确保 header 在最上层 -->
            <NLayoutHeader position='absolute' style="height: 64px; z-index: 1001;" bordered>
                颐和园路
            </NLayoutHeader>

            <!-- 为内容区域添加顶部 padding 避免被 header 遮挡 -->
            <NLayoutContent position='absolute' :native-scrollbar="false" style="top: 64px; bottom: 64px;">
                <n-h2 v-for="i in 100">{{ i }}平山道</n-h2>
            </NLayoutContent>

            <NLayoutFooter position='absolute' style="height: 64px; z-index: 1000;" bordered>
                城府路
            </NLayoutFooter>
        </NLayout>
    </NConfigProvider>
</template>