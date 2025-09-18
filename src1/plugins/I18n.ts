import { createI18n } from "vue-i18n";
import enUS from '../assets/locales/en-us.json'
import zhCN from '../assets/locales/zh-cn.json'
import type { Language } from "../utils/Config.d";

type MessageSchema = typeof enUS | typeof zhCN

export const i18n = createI18n<[MessageSchema], Language>({
    legacy: false,
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS
    }
})
