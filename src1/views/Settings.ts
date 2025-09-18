import { NFloatButton, NIcon, NTabs } from 'naive-ui';
import { h } from 'vue';
import { defineComponent } from 'vue';
import AboutPane from '../components/Settings/AboutPane';
import GlobalPane from '../components/Settings/GlobalPane';
import FinvizPane from '../components/Settings/FinvizPane';
import TimeWindowPane from '../components/Settings/TimeWindowPane';
import { RefreshCircleSharp, SaveSharp } from '@vicons/ionicons5';
import Config from '../utils/Config';
import { useConfig, useDiscreteApi } from '../plugins/DTBox';
import { useI18n } from 'vue-i18n';

export default defineComponent(() => {

    const { t } = useI18n();

    const save_button = () => h(NFloatButton, {
        bottom: '50px',
        right: '50px',
        onClick: () => {
            Config.Save(useConfig().value);
            useDiscreteApi().message.success(t('Save'));
        }
    }, () => h(NIcon, null, () => h(SaveSharp)));

    const reset_button = () => h(NFloatButton, {
        bottom: '50px',
        right: '100px',
        onClick: () => {
            Config.Save(Config.DEFAULT);
            useConfig().value = Config.DEFAULT;
            useDiscreteApi().message.success(t('Reset'));
        }
    }, () => h(NIcon, null, () => h(RefreshCircleSharp)));

    const tabs = () => h(NTabs, {
        type: 'segment',
        animated: true,
        defaultValue: 'global',
    }, () => [GlobalPane(), FinvizPane(), TimeWindowPane(), AboutPane()]);

    const render = () => h('div', [tabs(), save_button(), reset_button()])

    return render;
});