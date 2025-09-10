import { defineComponent, h, onUnmounted, ref } from 'vue';
import { NBackTop, NFlex, NFloatButton, NIcon, NSelect, NTabPane, NTabs } from 'naive-ui';
import { PlayCircle, StopCircle } from '@vicons/ionicons5';
import { useI18n } from 'vue-i18n';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import FinvizApi, { type ThumbnailType } from '../api/Finviz';
import type { FinvizScreenerItem } from '../api/Type';
import ScreenerTable from '../components/Finviz/ScreenerTable';
import ScreenerCharts from '../components/Finviz/ScreenerCharts';
import { useConfig, useDiscreteApi } from '../plugins/DTBox';

interface ScreenerParameter {
    parameter: string,
    auto_refresh: number,
    thumbnail_type: string
}

const parameter_list = useConfig().value.finviz.screener_parameter_list;

const filter_screener = (array: FinvizScreenerItem[]) => {
    const ignoreList = useConfig().value.finviz.ignore;
    return array.filter(item => !ignoreList.includes(item.Symbol));
}

export default defineComponent(() => {

    const { t } = useI18n();
    const auto_refresh_list = [
        {
            label: '10' + t('Second'),
            value: 10 * 1000
        },
        {
            label: '30' + t('Second'),
            value: 30 * 1000
        },
        {
            label: '1' + t('Minute'),
            value: 60 * 1000
        },
        {
            label: '3' + t('Minute'),
            value: 3 * 60 * 1000
        }
    ];

    const thumbnail_type_list: {
        label: string;
        value: typeof FinvizApi.FinvizThumbnails[keyof typeof FinvizApi.FinvizThumbnails];
    }[] = [
            { label: t('Day'), value: FinvizApi.FinvizThumbnails.D },
            { label: '1' + t('Minute'), value: FinvizApi.FinvizThumbnails.I1 },
            { label: '3' + t('Minute'), value: FinvizApi.FinvizThumbnails.I3 },
            { label: '5' + t('Minute'), value: FinvizApi.FinvizThumbnails.I5 },
        ];
    const is_runing = ref(false);
    const loadingBar = useDiscreteApi().loadingBar;
    const screener_parameter = ref<ScreenerParameter>({
        parameter: parameter_list[0].value,
        auto_refresh: auto_refresh_list[0].value,
        thumbnail_type: thumbnail_type_list[0].value
    });
    const screener_data = ref<FinvizScreenerItem[]>([]);
    const refresh_time_id = ref<number>();

    const parameter_form = (parameter: ScreenerParameter) => {
        return new Promise<ScreenerParameter>((resolve, _) => {
            const parameter_select = () => [t('Screener') + t('Parameter'), h(NSelect, {
                options: parameter_list as SelectMixedOption[],
                value: parameter.parameter,
                onUpdateValue: (value) => parameter.parameter = value,
            })];

            const auto_refresh_select = () => [t('Auto') + t('Refresh'), h(NSelect, {
                options: auto_refresh_list as SelectMixedOption[],
                value: parameter.auto_refresh,
                onUpdateValue: (value) => parameter.auto_refresh = value,
            })];
            const thumbnail_type_select = () => [t('Thumbnail') + t('Type'), h(NSelect, {
                options: thumbnail_type_list,
                value: parameter.thumbnail_type,
                onUpdateValue: (value) => parameter.thumbnail_type = value
            })];

            const content = () => h(NFlex, {
                vertical: true
            }, () => [parameter_select(), auto_refresh_select(), thumbnail_type_select()])

            useDiscreteApi().modal.create({
                title: t('Parameter') + t('Form'),
                style: {
                    width: '400px',
                    height: '320px'
                },
                preset: 'dialog',
                showIcon: false,
                content,
                positiveText: t('Confirm'),
                onPositiveClick: () => {
                    resolve(parameter);
                }
            })
        })
    }

    const manager_button_click = () => {
        if (is_runing.value) {
            is_runing.value = false;
            clearTimeout(refresh_time_id.value);
        } else {
            parameter_form(screener_parameter.value).then((data) => {
                screener_parameter.value = data;
                is_runing.value = true;
                screener_data_update();
            })
        }
    }

    const screener_data_update = () => {
        loadingBar.start();
        FinvizApi.Export_Screener(screener_parameter.value.parameter, useConfig().value.finviz.token).then((data) => {
            screener_data.value = filter_screener(data);
            useDiscreteApi().loadingBar.finish();
            refresh_time_id.value = setTimeout(() => screener_data_update(), screener_parameter.value.auto_refresh);
        }).catch(() => loadingBar.error())
    };

    onUnmounted(() => {
        loadingBar.finish();
        clearTimeout(refresh_time_id.value);
    });

    const manager_button = () => {
        const icon = () => h(NIcon, null, () => is_runing.value ? h(StopCircle) : h(PlayCircle));
        return h(NFloatButton, {
            top: '50px',
            right: '50px',
            onClick: () => manager_button_click()
        }, () => icon())
    }

    const screener_table = () => h(NTabPane, {
        name: 'table',
        tab: t('Table')
    }, () => ScreenerTable(screener_data.value, screener_parameter.value?.thumbnail_type as ThumbnailType));

    const screener_charts = () => h(NTabPane, {
        name: 'charts',
        tab: t('Charts')
    }, () => ScreenerCharts(screener_data.value, screener_parameter.value?.thumbnail_type as ThumbnailType));

    const back_top_button = () => h(NBackTop, {
        bottom: '50px',
        right: '50px'
    });

    const content = () => h(NTabs, {
        type: 'segment',
        animated: true,
        defaultValue: 'table',
    }, () => [screener_table(), screener_charts()])
    const render = () => h(NFlex, {
        vertical: true
    }, () => [content(), back_top_button(), manager_button()]);

    return render;
});