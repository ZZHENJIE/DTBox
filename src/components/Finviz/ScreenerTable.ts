import { NDataTable, NPopover, NText, type DataTableColumns } from "naive-ui";
import type { FinvizScreenerItem } from "../../api/Type";
import { h, reactive } from "vue";
import { useI18n } from "vue-i18n";
import FinvizApi, { type ThumbnailType } from "../../api/Finviz";
import MImage from "../MImage";
import MEllipsis from "../MEllipsis";
import { useConfig } from "../../plugins/DTBox";

export default (array: FinvizScreenerItem[], thumbnail_type: ThumbnailType = 'd') => {

    const { t } = useI18n();
    const theme = useConfig().value.is_dark_theme ? 'd' : 'l';

    const renderChange = (value: number) => {
        const color = value > 0 ? '#90EE90' : '#DB7093';
        return h(NText, {
            style: {
                color: color
            },
        }, () => value + '%');
    };

    const thumbnail_dimensions = FinvizApi.Get_Thumbnail_Image_Dimensions(thumbnail_type);

    const columns: DataTableColumns<FinvizScreenerItem> = [
        {
            title: () => MEllipsis(t('Symbol')),
            key: 'Symbol',
            width: '80px',
            render: (row) => h(NPopover, {
                trigger: 'hover',
                placement: 'bottom-start',
            }, {
                trigger: () => row.Symbol,
                default: () => h(MImage({
                    width: thumbnail_dimensions.width,
                    height: thumbnail_dimensions.height,
                    previewDisabled: true,
                    src: FinvizApi.Thumbnail_Image_Url(row.Symbol, theme, thumbnail_type)
                })),
            })
        },
        {
            title: () => MEllipsis(t('Company')),
            key: 'Company',
            render: (row) => MEllipsis(row.Company)
        },
        {
            title: () => MEllipsis(`${t('Sector')}/${t('Industry')}`),
            key: 'SectorIndustry',
            render: (row) => MEllipsis(`${row.Sector} / ${row.Industry}`)
        },
        {
            title: () => MEllipsis(t('Market_Cap')),
            key: 'MarketCap',
            width: '100px',
            render: (row) => MEllipsis(row.MarketCap || 'N/A'),
        },
        {
            title: () => MEllipsis(t('PriceEarningsRatio')),
            key: 'PriceEarningsRatio',
            width: '100px',
            render: (row) => MEllipsis(row.PriceEarningsRatio || 'N/A'),
        },
        {
            title: () => MEllipsis(t('Price')),
            key: 'Price',
            width: '100px',
            render: (row) => MEllipsis(row.Price),
        },
        {
            title: () => MEllipsis(t('Change')),
            key: 'Change',
            width: '100px',
            render: (row) => renderChange(parseFloat(row.Change)),
        },
        {
            title: () => MEllipsis(t('Volume')),
            key: 'Volume',
            width: '100px',
            render: (row) => MEllipsis(row.Volume)
        }
    ];

    const paginationReactive = reactive({
        page: 1,
        pageSize: 20,
        showSizePicker: true,
        pageSizes: [20, 40, 60],
        onChange: (page: number) => {
            paginationReactive.page = page
        },
        onUpdatePageSize: (pageSize: number) => {
            paginationReactive.pageSize = pageSize
            paginationReactive.page = 1
        }
    })

    return h(NDataTable, {
        columns,
        data: array,
        pagination: paginationReactive,
    });
}