import { defineComponent, h, ref } from 'vue';
import IposcoopApi from '../api/Iposcoop';
import type { IPOItem } from '../api/Type';
import { NDataTable, type DataTableColumns } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import MEllipsis from '../components/MEllipsis';

export default defineComponent(() => {
    const { t } = useI18n();
    const calendar_data = ref<IPOItem[]>();
    const loading = ref(true);

    IposcoopApi.Calendar().then((data) => {
        calendar_data.value = data;
        loading.value = false;
    })

    const columns: DataTableColumns<IPOItem> = [
        {
            title: () => MEllipsis(t('Symbol')),
            key: 'Symbol',
            width: 80,
            render: (row) => MEllipsis(row.Symbol)
        },
        {
            title: () => MEllipsis(t('Company')),
            key: 'Company',
            render: (row) => MEllipsis(row.Company)
        },
        {
            title: () => MEllipsis(t('Managers')),
            key: 'Managers',
            render: (row) => MEllipsis(row.Managers)
        },
        {
            title: () => MEllipsis(`${t('Shares')}(${t('Millions')})`),
            key: 'Shares_Millions',
            width: 100,
            render: (row) => MEllipsis(row.Shares_Millions)
        },
        {
            title: () => MEllipsis(t('Price')),
            key: 'Price',
            width: 100,
            render: (row) => MEllipsis(row.Price)
        },
        {
            title: () => MEllipsis(`${t('Estimated')}${t('Volume')}`),
            key: 'Estimated_Dollar_Volume',
            width: 100,
            render: (row) => MEllipsis(row.Estimated_Dollar_Volume)
        },
        {
            title: () => MEllipsis(`${t('Estimated')}${t('Date')}`),
            key: 'Estimated_Date',
            width: 120,
            render: (row) => MEllipsis(row.Estimated_Date)
        }
    ];

    return () => h(NDataTable, {
        columns: columns,
        data: calendar_data.value,
        loading: loading.value
    });
});