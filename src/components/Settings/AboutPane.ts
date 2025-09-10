import { NTabPane } from "naive-ui"
import { h } from "vue"
import { useI18n } from "vue-i18n"

export default () => {

    const { t } = useI18n();

    return h(NTabPane, {
        name: 'about',
        tab: t('About')
    })
}