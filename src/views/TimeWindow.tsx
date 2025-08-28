import { defineComponent, h, onUnmounted, ref } from 'vue';
import { NTime } from 'naive-ui';
import Tool from '../utils/Tool';
import WallstreetcnApi from '../api/Wallstreetcn';
import { useI18n } from 'vue-i18n';

export default defineComponent(() => {
    const { t } = useI18n();
    const timestamp = ref(0);
    const timeout_id = ref(0);
    const macro_calendar_data = ref();
    const warn_list = ref<any[]>([]);

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    WallstreetcnApi.Calendar(date.getTime() / 1000, date.getTime() / 1000 + 86399)
        .then(json => {
            macro_calendar_data.value = json.data.items; Tool.Akamai_Timestamp().then(object => {
                timestamp.value = Number(object);
                auto_update_timestamp();
            })
        });
    const auto_update_timestamp = () => {
        timestamp.value++;
        timeout_id.value = setTimeout(() => {
            auto_update_timestamp();
        }, 1000);

        warn_list.value = [];
        if ((timestamp.value + 28800) % 86400 === 0) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        for (const item of macro_calendar_data.value) {
            if (item.country_id === 'US' && item.public_date < (timestamp.value + 300) && timestamp.value < item.public_date) {
                warn_list.value.push(item);
            }
        }
    }

    const warn_info = () => {
        if (warn_list.value.length != 0) {
            const max_importance = Math.max(...warn_list.value.map(item => item.importance));
            return `${t('Length')} : ${warn_list.value.length} ${t('Max')} : ${'★'.repeat(max_importance)}`;
        }
    }

    onUnmounted(() => clearTimeout(timeout_id.value));
    const render = () => h('div', {
        style: {
            'text-align': 'center'
        }
    }, [h(NTime, {
        time: timestamp.value * 1000,
        format: 'HH:mm:ss',
        style: {
            'color': '#6495ED',
            'font-size': '30px',
        },
        class: warn_list.value.length != 0 ? 'breathing-element' : ''
    }), h('br'), warn_info()]);

    return render;
});