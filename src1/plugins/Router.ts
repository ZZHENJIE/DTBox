import { useI18n } from 'vue-i18n';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const Finviz: RouteRecordRaw[] = [
    {
        path: '/finviz_screener',
        name: 'FinvizScreener',
        meta: {
            title: () => useI18n().t('Screener'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/FinvizScreener.ts')
    },
    {
        path: '/finviz_analysis',
        name: 'FinvizAnalysis',
        meta: {
            title: () => useI18n().t('Analysis'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/FinvizAnalysis.ts')
    }
];

const Calendar: RouteRecordRaw[] = [
    {
        path: '/macro_calendar',
        name: 'MacroCalendar',
        meta: {
            title: () => useI18n().t('Macro'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/MacroCalendar.ts')
    },
    {
        path: '/spac_calendar',
        name: 'SPACCalendar',
        meta: {
            title: () => useI18n().t('SPAC'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/SPACCalendar.ts')
    },
    {
        path: '/ipo_calendar',
        name: 'IPOCalendar',
        meta: {
            title: () => useI18n().t('IPO'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/IPOCalendar.ts')
    },
];

const Viewer: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        meta: {
            title: () => useI18n().t('Home'),
            menu_enable: false,
            standalone: false
        },
        component: () => import('../views/Home.ts')
    },
    {
        path: '/charts',
        name: 'Charts',
        meta: {
            title: () => useI18n().t('Charts'),
            menu_enable: true,
            standalone: false
        },
        component: () => import('../views/Charts.ts')
    },
    {
        path: '/settings',
        name: 'Settings',
        meta: {
            title: () => useI18n().t('Settings'),
            menu_enable: false,
            standalone: false
        },
        component: () => import('../views/Settings.ts')
    },
    {
        path: '/time',
        name: 'Time',
        meta: {
            title: () => useI18n().t('TimeWindow'),
            menu_enable: false,
            standalone: true
        },
        component: () => import('../views/TimeWindow.ts')
    },
];

export const Router = createRouter({
    history: createWebHistory(),
    routes: [
        ...Viewer,
        ...Finviz,
        ...Calendar
    ]
});

export default {
    Router,
    Finviz,
    Calendar,
    Viewer
};