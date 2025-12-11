<template>
    <NConfigProvider :theme="get_theme()" inlineThemeDisabled>
        <NNotificationProvider>
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
                        <img
                            @click="$router.push('/')"
                            src="./assets/image/dtbox.svg"
                            style="width: 50px; cursor: pointer"
                        />
                        <NText style="font-size: 36px; padding-right: 60px"
                            >DTBox</NText
                        >

                        <SymbolSerach />

                        <NDropdown
                            v-for="option in options"
                            trigger="hover"
                            :options="option.value"
                            @select="dropdown_handle_select"
                        >
                            <NButton secondary :type="option.type">{{
                                option.table
                            }}</NButton>
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
                        <NButton quaternary circle @click="change_theme">
                            <NIcon size="40">
                                <ContrastSharp />
                            </NIcon>
                        </NButton>
                        <NButton
                            quaternary
                            circle
                            @click="
                                openUrl('https://github.com/ZZHENJIE/DTBox')
                            "
                        >
                            <NIcon size="40">
                                <LogoGithub />
                            </NIcon>
                        </NButton>

                        <AboutDropdown />
                    </div>
                </NLayoutHeader>
                <RouterView style="top: 64px"></RouterView>
            </NLayout>
        </NNotificationProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { darkTheme, lightTheme, NText } from "naive-ui";
import { LogoGithub, ContrastSharp } from "@vicons/ionicons5";
import Menu from "./utils/menu";
import { openUrl } from "./utils/tool";
import { useRouter } from "vue-router";
import SymbolSerach from "./components/symbol_serach.vue";
import AboutDropdown from "./components/about_dropdown.vue";

const is_dark = ref(true);
const options = ref(Menu);
const $router = useRouter();

const dropdown_handle_select = (key: string) => {
    $router.push(key);
};

const change_theme = () => {
    is_dark.value = !is_dark.value;
};

const get_theme = () => {
    return is_dark.value ? darkTheme : lightTheme;
};
</script>
