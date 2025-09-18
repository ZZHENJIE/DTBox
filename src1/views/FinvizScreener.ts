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
import Config from '../utils/Config';

const filter_screener = (array: FinvizScreenerItem[]) => {
    const ignoreList = useConfig().value.finviz.ignore;
    return array.filter(item => !ignoreList.includes(item.Symbol));
}

export default defineComponent(() => {

    const { t } = useI18n();
    const parameter_list = useConfig().value.finviz.screener_parameter_list;
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
    const screener_data = ref<FinvizScreenerItem[]>([]);
    const refresh_time_id = ref<number>();
    const parameter = ref(useConfig().value.finviz.screener_parameter);

    const parameter_form = () => {
        return new Promise<boolean>((resolve, _) => {
            const parameter_select = () => [t('Screener') + t('Parameter'), h(NSelect, {
                options: parameter_list as SelectMixedOption[],
                value: parameter.value.parameter,
                onUpdateValue: (value) => parameter.value.parameter = value,
            })];

            const auto_refresh_select = () => [t('Auto') + t('Refresh'), h(NSelect, {
                options: auto_refresh_list as SelectMixedOption[],
                value: parameter.value.auto_refresh,
                onUpdateValue: (value) => parameter.value.auto_refresh = value,
            })];
            const thumbnail_type_select = () => [t('Thumbnail') + t('Type'), h(NSelect, {
                options: thumbnail_type_list,
                value: parameter.value.thumbnail_type,
                onUpdateValue: (value) => parameter.value.thumbnail_type = value
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
                    Config.Save(useConfig().value)
                    resolve(true);
                }
            })
        })
    }

    const manager_button_click = () => {
        if (is_runing.value) {
            is_runing.value = false;
            clearTimeout(refresh_time_id.value);
        } else {
            parameter_form().then((value) => {
                if (value) {
                    is_runing.value = true;
                    screener_data_update();
                }
            })
        }
    }

    const screener_data_update = () => {
        loadingBar.start();
        FinvizApi.Export_Screener(parameter.value.parameter, useConfig().value.finviz.token).then((data) => {
            screener_data.value = filter_screener(data);
            useDiscreteApi().loadingBar.finish();
            refresh_time_id.value = setTimeout(() => screener_data_update(), parameter.value.auto_refresh);
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
    }, () => ScreenerTable(screener_data.value, parameter.value.thumbnail_type as ThumbnailType));

    const screener_charts = () => h(NTabPane, {
        name: 'charts',
        tab: t('Charts')
    }, () => ScreenerCharts(screener_data.value, parameter.value.thumbnail_type as ThumbnailType));

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