import { NButton, NConfigProvider, NFlex, NIcon, NLayout, NLayoutContent, NLayoutSider, NMenu, type MenuOption } from "naive-ui";
import { defineComponent, h, onMounted } from 'vue';
import { ArrowBackCircle, Home, SettingsSharp } from "@vicons/ionicons5";
import { RouterView, useRoute, useRouter } from "vue-router";
import Router from "./plugins/Router";
import { useI18n } from "vue-i18n";
import { Init, provider_props_ref, useConfig, useDiscreteApi } from "./plugins/DTBox";
import TimeWindowButton from "./components/TimeWindowButton";

export default defineComponent(() => {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const menu_options: MenuOption[] = [
        {
            label: () => t('Finviz'),
            key: 'Finviz',
            children: Router.Finviz.filter(r => r.meta?.menu_enable)
                .map(r => ({
                    label: r.meta?.title as () => string,
                    key: r.name as string,
                    path: r.path,
                    standalone: r.meta?.standalone
                }))
        },
        {
            label: () => t('Calendar'),
            key: 'Calendar',
            children: Router.Calendar.filter(r => r.meta?.menu_enable)
                .map(r => ({
                    label: r.meta?.title as () => string,
                    key: r.name as string,
                    path: r.path,
                    standalone: r.meta?.standalone
                }))
        },
        ...Router.Viewer.filter(r => r.meta?.menu_enable)
            .map(r => ({
                label: r.meta?.title as () => string,
                key: r.name as string,
                path: r.path,
                standalone: r.meta?.standalone
            }))
    ];

    const layout_sider = () => {
        if (!route?.meta.standalone) {
            const home_button = () => h(NButton, {
                round: true,
                onClick: () => router.push({ name: 'Home' }),
                renderIcon: () => h(NIcon, null, () => h(Home))
            })

            const back_button = () => h(NButton, {
                round: true,
                onClick: () => router.back(),
                renderIcon: () => h(NIcon, null, () => h(ArrowBackCircle))
            })

            const settings_button = () => h(NButton, {
                round: true,
                onClick: () => router.push({ name: 'Settings' }),
                renderIcon: () => h(NIcon, null, () => h(SettingsSharp))
            })

            const menu = () => h(NMenu, {
                options: menu_options,
                style: { width: '185px' },
                value: route.name as string,
                onUpdateValue: (value) => router.push({ name: value })
            })

            return h(NLayoutSider, {
                nativeScrollbar: false,
                width: '200px',
                collapsedWidth: 15,
                showTrigger: true,
                contentStyle: {
                    'padding-top': '5px'
                },
            }, () => h(NFlex, {
                justify: 'center'
            }, () => [home_button(), back_button(), settings_button(), , h(TimeWindowButton), menu()]))
        }
    }

    const kimi_button = () => h('div');

    const router_view = () => h('div', {
        style: {
            'padding': '5px'
        }
    }, h(RouterView))

    const layout_content = () => h(NLayoutContent, {
        nativeScrollbar: false,
    }, () => [router_view(), kimi_button()])

    const main_layout = () => h(NLayout, {
        position: 'absolute',
        hasSider: true
    }, () => [layout_sider(), layout_content()])

    const render = () => h(NConfigProvider, {
        inlineThemeDisabled: true,
        theme: provider_props_ref.value.theme,
    }, () => main_layout())

    onMounted(() => {
        useI18n().locale.value = useConfig().value.language;
        setTimeout(() => {
            if (!route?.meta.standalone) {
                const init_message = useDiscreteApi().message.loading(`${t('Initializing')}...`, {
                    duration: 0
                });
                Init()
                    .then(() => init_message.destroy())
                    .catch((error) => {
                        init_message.destroy();
                        useDiscreteApi().message.error(`Init: ${error}`);
                    });
            }
        }, 500);
    })

    return render;
});