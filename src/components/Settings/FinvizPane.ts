import { NButton, NDescriptions, NDescriptionsItem, NDynamicInput, NTabPane } from "naive-ui"
import { h, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useConfig, useDiscreteApi } from "../../plugins/DTBox";

export default () => {

    const { t } = useI18n();
    const parameter = ref<{ key: string; value: string }[]>(
        useConfig().value.finviz.screener_parameter_list.map((item) => ({
            key: item.label,
            value: item.value,
        }))
    );

    const parameter_edit = () => {

        useDiscreteApi().modal.create({
            preset: 'dialog',
            style: {
                width: '800px',
                height: '600px',
            },
            title: () => t('Parameter'),
            showIcon: false,
            content: () => h(NDynamicInput, {
                preset: 'pair',
                showSortButton: true,
                keyPlaceholder: t('Label'),
                valuePlaceholder: t('Value'),
                value: parameter.value,
                onUpdateValue: (value: any[]) => parameter.value = value
            }),
            positiveText: t('Confirm'),
            onPositiveClick: () => {
                useConfig().value.finviz.screener_parameter_list = parameter.value.map((item) => ({
                    label: item.key,
                    value: item.value,
                }));
                useDiscreteApi().message.success(t('Success'))
            }
        })
    }

    const parameter_button = () => {
        return h(NButton, {
            onClick: () => parameter_edit()
        }, () => t('Edit'))
    }

    const descriptions = () => h(NDescriptions, {
        columns: 4
    }, () => [
        h(NDescriptionsItem, {
            label: t('Screener') + t('Parameter')
        }, () => parameter_button())
    ])

    return h(NTabPane, {
        name: 'finviz',
        tab: t('Finviz')
    }, () => descriptions())
}