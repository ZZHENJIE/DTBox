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

const filter_screener = (array: FinvizScreenerItem[]) => {
    const ignoreList = useConfig().value.finviz.ignore;
    return array.filter(item => !ignoreList.includes(item.Symbol));
}

export default defineComponent(() => {

    const { t } = useI18n();
    const is_runing = ref(false);
    const loadingBar = useDiscreteApi().loadingBar;
    const screener_parameter = ref<ScreenerParameter>();
    const screener_data = ref<FinvizScreenerItem[]>([]);
    const refresh_time_id = ref<number>();

    const parameter_form = () => {
        return new Promise<ScreenerParameter>((resolve, _) => {

            const parameter_list = useConfig().value.finviz.screener_parameter_list;
            const parameter = ref(parameter_list[0].value);
            const parameter_select = () => h(NSelect, {
                placeholder: t('Please_Select'),
                options: parameter_list as SelectMixedOption[],
                value: parameter.value,
                onUpdateValue: (value) => parameter.value = value,
            });

            const auto_refresh_list = [
                {
                    label: '10秒',
                    value: 10 * 1000
                },
                {
                    label: '30秒',
                    value: 30 * 1000
                },
                {
                    label: '1分钟',
                    value: 60 * 1000
                },
                {
                    label: '3分钟',
                    value: 3 * 60 * 1000
                }
            ];
            const auto_refresh = ref(auto_refresh_list[0].value);

            const auto_refresh_select = () => h(NSelect, {
                placeholder: t('Please_Select'),
                options: auto_refresh_list as SelectMixedOption[],
                value: auto_refresh.value,
                onUpdateValue: (value) => auto_refresh.value = value,
            });

            const thumbnail_type_list: {
                label: string;
                value: typeof FinvizApi.FinvizThumbnails[keyof typeof FinvizApi.FinvizThumbnails];
            }[] = [
                    { label: "Day", value: FinvizApi.FinvizThumbnails.D },
                    { label: "1 Minute", value: FinvizApi.FinvizThumbnails.I1 },
                    { label: "3 Minute", value: FinvizApi.FinvizThumbnails.I3 },
                    { label: "5 Minute", value: FinvizApi.FinvizThumbnails.I5 },
                ];

            const thumbnail_type = ref(thumbnail_type_list[0].value);

            const thumbnail_type_select = () => h(NSelect, {
                placeholder: t('Please_Select'),
                options: thumbnail_type_list,
                value: thumbnail_type.value,
                onUpdateValue: (value) => thumbnail_type.value = value
            })

            const content = () => h(NFlex, {
                vertical: true
            }, () => [parameter_select(), auto_refresh_select(), thumbnail_type_select()])

            useDiscreteApi().modal.create({
                title: t('Parameter_Form'),
                style: {
                    width: '400px',
                    height: '240px'
                },
                preset: 'dialog',
                showIcon: false,
                content,
                positiveText: t('Confirm'),
                onPositiveClick: () => {
                    resolve({
                        parameter: parameter.value,
                        auto_refresh: auto_refresh.value,
                        thumbnail_type: thumbnail_type.value
                    });
                }
            })
        })
    }

    const manager_button_click = () => {
        if (is_runing.value) {
            is_runing.value = false;
            clearTimeout(refresh_time_id.value);
        } else {
            parameter_form().then((data) => {
                screener_parameter.value = data;
                is_runing.value = true;
                screener_data_update();
            })
        }
    }

    const screener_data_update = () => {
        const parameter = screener_parameter.value;
        if (parameter) {
            loadingBar.start();
            FinvizApi.Export_Screener(parameter.parameter, useConfig().value.finviz.token).then((data) => {
                screener_data.value = filter_screener(data);
                useDiscreteApi().loadingBar.finish();
                refresh_time_id.value = setTimeout(() => screener_data_update(), parameter.auto_refresh);
            }).catch(() => loadingBar.error())
        }
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