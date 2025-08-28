import { defineComponent, h, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WallstreetcnApi from '../api/Wallstreetcn';
import { NDataTable, NDatePicker, NFloatButton, NIcon, NPopover, NTime, type DataTableColumns } from 'naive-ui';
import MEllipsis from '../components/MEllipsis';
import { CalendarSharp } from '@vicons/ionicons5';

function get_defult_date() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
}

export default defineComponent(() => {

    const { t } = useI18n();
    const calendar_data = ref();
    const date = ref(get_defult_date());
    const loading = ref(true);

    const calendar_update = (timestamp: number) => {
        WallstreetcnApi.Calendar(timestamp, timestamp + 86399).then((json) => {
            calendar_data.value = json.data.items;
            loading.value = false;
        })
    };

    calendar_update(date.value / 1000);

    const columns: DataTableColumns<any> = [
        {
            title: () => MEllipsis(t('Date')),
            key: 'public_date',
            width: 100,
            render: (row) => row.public_date % 86400 == 14520 ?
                MEllipsis(t('Undetermined')) :
                h(NTime, { time: row.public_date * 1000, format: 'HH:mm:ss' })
        },
        {
            title: () => MEllipsis(t('Country')),
            key: 'country_id',
            width: 110,
            render: (row) => MEllipsis(row.country_id),
            defaultFilterOptionValues: ['US'],
            filterOptions: [
                {
                    label: 'US',
                    value: 'US'
                },
            ],
            filter(value, row) {
                return row.country_id === value
            }
        },
        {
            title: () => MEllipsis(t('Event')),
            key: 'event',
            render: (row) => MEllipsis(row.title)
        },
        {
            title: () => MEllipsis(t('Importance')),
            key: 'importance',
            width: 100,
            render: (row) => MEllipsis('★'.repeat(row.importance))
        },
        {
            title: () => MEllipsis(t('Actual')),
            key: 'actual',
            render: (row) => row.actual === '' ? MEllipsis('--') : MEllipsis(row.actual + row.unit)
        },
        {
            title: () => MEllipsis(t('Forecast')),
            key: 'forecast',
            render: (row) => row.forecast === '' ? MEllipsis('--') : MEllipsis(row.forecast + row.unit)
        },
        {
            title: () => MEllipsis(t('Previous')),
            key: 'previous',
            render: (row) => row.previous === '' ? MEllipsis('--') : MEllipsis(row.previous + row.unit)
        },
    ]

    const data_table = () => h(NDataTable, {
        data: calendar_data.value,
        columns: columns,
        loading: loading.value
    });

    const date_picker = () => h(NPopover, {
        trigger: 'click',
        placement: 'bottom-start'
    }, {
        trigger: () => h(NFloatButton, {
            top: '50px',
            right: '50px'
        }, () => h(NIcon, null, () => h(CalendarSharp))),
        default: () => h(NDatePicker, {
            value: date.value,
            panel: true,
            onUpdateValue: (value: number) => {
                date.value = value;
                calendar_update(date.value / 1000);
            },
        })
    });
    const render = () => h("div", null, [data_table(), date_picker()]);

    return render;
});