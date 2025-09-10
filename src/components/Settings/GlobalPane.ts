import { NDescriptions, NDescriptionsItem, NRadioButton, NRadioGroup, NSwitch, NTabPane } from "naive-ui"
import { h } from "vue"
import { useI18n } from "vue-i18n"
import { useConfig } from "../../plugins/DTBox";

export default () => {

    const { t, locale } = useI18n();

    const theme_switch = () => h(NSwitch, {
        value: useConfig().value.is_dark_theme,
        onUpdateValue: (value: boolean) => useConfig().value.is_dark_theme = value
    });

    const zh_cn_radio_button = () => h(NRadioButton, {
        value: 'zh-CN'
    }, () => '简体中文');
    const en_us_radio_button = () => h(NRadioButton, {
        value: 'en-US'
    }, () => 'English');

    const language_switch = () => h(NRadioGroup, {
        value: useConfig().value.language,
        onUpdateValue: (value: string) => {
            useConfig().value.language = value as any;
            locale.value = value;
        }
    }, () => [zh_cn_radio_button(), en_us_radio_button()])

    const descriptions = () => h(NDescriptions, {
        columns: 4
    }, () => [
        h(NDescriptionsItem, {
            label: t('Theme')
        }, () => theme_switch()),
        h(NDescriptionsItem, {
            label: t('Language')
        }, () => language_switch()),
    ])

    return h(NTabPane, {
        name: 'global',
        tab: t('Global')
    }, () => descriptions())
}