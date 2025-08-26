import { NButton, NPopover, NTime } from "naive-ui";
import { defineComponent, h, onUnmounted, ref } from "vue";
import Tool from "../utils/Tool";
import { useI18n } from "vue-i18n";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default defineComponent(() => {

    const { t } = useI18n();
    const timestamp = ref(0);
    const timeout_id = ref(0);
    const window = ref<WebviewWindow>();

    Tool.Akamai_Timestamp().then(object => {
        timestamp.value = Number(object) * 1000;
        auto_update_timestamp();
    });

    const show_time_window = () => {
        window.value = new WebviewWindow('time', {
            title: t('Time_Window'),
            url: "/time",
            width: 400,
            height: 150,
            alwaysOnTop: true,
            titleBarStyle: 'overlay'
        });
    }

    const auto_update_timestamp = () => {
        timestamp.value += 1000;
        timeout_id.value = setTimeout(() => {
            auto_update_timestamp();
        }, 1000);
    }

    onUnmounted(() => clearTimeout(timeout_id.value));

    return () => h(NPopover, {
        trigger: 'hover',
        placement: 'bottom-start'
    }, {
        trigger: () => h(NButton, {
            onClick: () => show_time_window()
        }, () => h(NTime, {
            time: timestamp.value,
            format: 'HH:mm:ss'
        })),
        default: () => t('Show_Time_Window')
    })
})

