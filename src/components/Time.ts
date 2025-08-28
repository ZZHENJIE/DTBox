import { defineComponent, h, onUnmounted, ref } from "vue";
import Tool from "../utils/Tool";
import { NTime } from "naive-ui";

export default (style?: unknown) => {
    return defineComponent(() => {

        const timestamp = ref(0);
        const timeout_id = ref(0);

        Tool.Akamai_Timestamp().then(object => {
            timestamp.value = Number(object) * 1000;
            auto_update_timestamp();
        });
        const auto_update_timestamp = () => {
            timestamp.value += 1000;
            timeout_id.value = setTimeout(() => {
                auto_update_timestamp();
            }, 1000);
        }

        onUnmounted(() => clearTimeout(timeout_id.value));

        return () => h(NTime, {
            time: timestamp.value,
            format: 'HH:mm:ss',
            style: style
        })
    })
}