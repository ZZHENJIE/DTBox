<template>
    <NLayout
        position="absolute"
        content-style="padding: 24px;"
        :native-scrollbar="false"
    >
        <NSpace vertical size="large" style="max-width: 800px; margin: 0 auto">
            <div style="text-align: center">
                <img
                    src="../assets/image/author.jpeg"
                    alt="Author"
                    style="
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        object-fit: cover;
                    "
                />
            </div>

            <NH1 style="text-align: center; margin: 0">
                <NText type="info">About DTBox Web</NText>
            </NH1>

            <NCard title="Introduction" hoverable>
                <NP>
                    DTBox Web is the official web project of DTBox—an
                    open-source, lightweight web application built with Naive UI
                    + Vite + Vue 3 + TypeScript. Clean UI, readable code,
                    contributions welcome.
                </NP>
            </NCard>

            <NCard title="Tech Stack">
                <div
                    style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 16px;
                    "
                >
                    <img style="height: 40px" src="../assets/image/vue.svg" />
                    <img style="height: 40px" src="../assets/image/vite.svg" />
                    <img style="height: 40px" src="../assets/image/naive.svg" />
                    <img
                        style="height: 40px"
                        src="../assets/image/typescript.svg"
                    />
                </div>
            </NCard>

            <NCard title="More" hoverable>
                <NSpace justify="center">
                    <NButton
                        @click="openUrl('https://github.com/ZZHENJIE/DTBox')"
                        round
                        ghost
                    >
                        <template #icon>
                            <NIcon><LogoGithub /></NIcon>
                        </template>
                        GitHub
                    </NButton>
                    <NButton
                        @click="
                            openUrl('https://space.bilibili.com/1362205077')
                        "
                        round
                        ghost
                    >
                        <template #icon>
                            <NIcon>
                                <img
                                    style="width: 18px"
                                    src="../assets/image/bilibili.svg"
                                />
                            </NIcon>
                        </template>
                        Bilibili
                    </NButton>
                </NSpace>
            </NCard>
        </NSpace>
    </NLayout>
</template>

<script setup lang="ts">
import { LogoGithub } from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { openUrl } from "../utils/tool";
</script>
