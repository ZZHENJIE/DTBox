import { defineComponent, h, onMounted, onUnmounted, ref, type VNode } from "vue";
import FutuApi from "../../api/Futu";
import { NAlert, NCard, NFlex, NTime } from "naive-ui";
import Tool from "../../utils/Tool";
import { useConfig } from "../../plugins/DTBox";

export default () => {
    return defineComponent({
        name: 'FlashNews',
        setup() {

            const data = ref([]);
            const timeout_id = ref(0);
            const is_mounted = ref(true);
            const level: Array<'default' | 'warning' | 'error' | 'info' | 'success'> = ['default', 'warning', 'error'];

            const update_data = () => {
                FutuApi.Flash_News(useConfig().value.language).then(object => {
                    data.value = object.data.data.news;
                    setTimeout(() => is_mounted.value ? update_data() : {}, 10000);
                });
            }

            onMounted(() => update_data());
            onUnmounted(() => {
                is_mounted.value = false;
                clearTimeout(timeout_id.value);
            });

            const cards = () => {
                const result: VNode[] = [];

                for (const item of data.value as any[]) {
                    const alert = () => h(NAlert, {
                        showIcon: false,
                        type: level[item.level]
                    }, () => item.content);

                    result.push(h(NCard, {
                        title: item.title,
                        action: () => h(NTime, {
                            time: item.time * 1000,
                            format: 'HH:mm:ss'
                        })
                    }, () => alert()))
                }

                return result;
            }

            const render = () => h(NFlex, {
                vertical: true
            }, () => cards());

            return () => render();
        }
    })
}