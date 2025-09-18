import { NButton, NPopover } from "naive-ui";
import { defineComponent, h, ref } from "vue";
import { useI18n } from "vue-i18n";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import Time from "./Time";

export default defineComponent(() => {

    const { t } = useI18n();
    const window = ref<WebviewWindow>();
    const show_time_window = () => {
        window.value = new WebviewWindow('time', {
            title: t('Time_Window'),
            url: "/time",
            width: 400,
            height: 150,
            alwaysOnTop: true,
            decorations: false,
            transparent: true,
            titleBarStyle: "overlay"
        });
    }

    return () => h(NPopover, {
        trigger: 'hover',
        placement: 'bottom-start'
    }, {
        trigger: () => h(NButton, {
            onClick: () => show_time_window(),
        }, () => h(Time())),
        default: () => t('Show_Time_Window')
    })
})

