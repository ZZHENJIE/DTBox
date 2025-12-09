<template>
    <NConfigProvider :theme="theme" inlineThemeDisabled>
        <NLayout position="absolute" hasSider>
            <NLayoutHeader
                bordered
                style="
                    height: 64px;
                    padding: 0 12px;
                    display: flex;
                    align-items: center;
                "
            >
                <div style="display: flex; align-items: center; gap: 12px">
                    <img src="./assets/image/dtbox.svg" style="width: 50px" />
                    <NText style="font-size: 36px; padding-right: 60px"
                        >DTBox</NText
                    >

                    <NDropdown
                        trigger="hover"
                        :options="options"
                        @select="dropdown_handle_select"
                    >
                        <NButton>找个地方休息</NButton>
                    </NDropdown>
                    <NDropdown trigger="hover" :options="options">
                        <NButton>找个地方休息</NButton>
                    </NDropdown>
                </div>

                <div
                    style="
                        margin-left: auto;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    "
                >
                    <NButton
                        quaternary
                        circle
                        style="background-color: aquamarine"
                    >
                        <NIcon><moon /></NIcon>
                    </NButton>
                    <NButton
                        quaternary
                        circle
                        tag="a"
                        href="https://github.com/ZZHENJIE/DTBox"
                        style="background-color: antiquewhite"
                        target="_blank"
                    >
                        <NIcon><github /></NIcon>
                    </NButton>
                </div>
            </NLayoutHeader>
            <RouterView style="top: 64px"></RouterView>
        </NLayout>
    </NConfigProvider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { darkTheme } from "naive-ui";

export default defineComponent({
    data() {
        return {
            theme: darkTheme,
            options: [
                {
                    label: "!!!About",
                    key: "/ipo",
                    disabled: true,
                },
                {
                    label: "Home",
                    key: "/",
                },
                {
                    label: "About",
                    key: "/about",
                },
                {
                    label: "比佛利山庄酒店，洛杉矶",
                    key: "the beverly hills hotel, los angeles",
                },
            ],
        };
    },
    methods: {
        dropdown_handle_select(key: string) {
            this.$router.push(key);
        },
    },
});
</script>
