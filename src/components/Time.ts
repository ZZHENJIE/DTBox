import { defineComponent, h, onUnmounted, ref } from "vue";
import Tool from "../utils/Tool";
import { NTime } from "naive-ui";

export default (style?: unknown) => {
    return defineComponent(() => {

        const timestamp = ref(0);
        const timer = ref(0);

        Tool.Akamai_Timestamp().then(object => {
            timestamp.value = Number(object);
            start_update_timestamp();
        });
        const start_update_timestamp = () => {
            if (timer.value) {
                clearInterval(timer.value);
            }
            timer.value = setInterval(() => {
                timestamp.value++;
            }, 1000);
        }

        onUnmounted(() => clearInterval(timer.value));

        return () => h(NTime, {
            time: timestamp.value * 1000,
            format: 'HH:mm:ss',
            style: style
        })
    })
}