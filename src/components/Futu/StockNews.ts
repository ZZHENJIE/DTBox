import { invoke } from "@tauri-apps/api/core";
import FutuApi from "../../api/Futu";
import { defineComponent, h, ref, type VNode } from "vue";
import { NCard, NEllipsis, NFlex, NHighlight, NScrollbar, NSpin } from "naive-ui";
import Tool from "../../utils/Tool";

export default (symbol: string, patterns: string[] = []) => {
    return defineComponent(() => {

        const is_loading = ref(true);
        const items: VNode[] = [];
        invoke('get_id_by_symbol', { symbol }).then((id) => {
            FutuApi.Stock_News(id as string).then(obj => {
                is_loading.value = false;
                for (const item of obj.data.list) {
                    const ellipsis = h(NEllipsis, {
                        expandTrigger: 'click',
                        lineClamp: 2
                    }, () => h(NHighlight, {
                        text: item.title,
                        patterns: patterns
                    }));

                    items.push(h(NCard, {
                        action: () => `${item.source} ${Tool.Format_Time(item.time, 'yyyy-mm-dd hh:MM:ss')}`
                    }, () => ellipsis));
                }
            })
        });

        return () => h(NScrollbar, {
            style: {
                'max-height': '500px'
            }
        }, () => h(NFlex, {
            vertical: true
        }, () => is_loading.value ? h(NSpin) : items));
    })
}