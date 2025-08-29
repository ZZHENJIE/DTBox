import { h, ref, type VNode } from "vue";
import type { FinvizScreenerItem } from "../../api/Type";
import { NButton, NCard, NEllipsis, NEmpty, NFlex, NPagination, NSpace } from "naive-ui";
import FinvizApi, { type ThumbnailType } from "../../api/Finviz";
import { useI18n } from "vue-i18n";
import { useConfig, useDiscreteApi } from "../../plugins/DTBox";
import Config from "../../utils/Config";
import StockNews from "../Futu/StockNews";
import MImage from "../MImage";

export default (array: FinvizScreenerItem[], thumbnail_type: ThumbnailType = 'd') => {
    const page = ref(1);
    const page_size = ref(12);
    const theme = useConfig().value.is_dark_theme ? 'd' : 'l';

    const current_page_data = () => {
        const start = (page.value - 1) * page_size.value;
        const end = start + page_size.value;
        return array.slice(start, end);
    }

    const image_dimensions = FinvizApi.Get_Thumbnail_Image_Dimensions(thumbnail_type);
    const ignore_text = useI18n().t('Ignore');

    const content = () => {
        const result: VNode[] = [];

        for (const item of current_page_data()) {
            result.push(h(NCard, {
                title: () => h(NEllipsis, { lineClamp: 1, style: { 'max-width': image_dimensions.width + 'px' } }, () => item.Company),
                headerExtra: () => { },
                content: () => h('div', {
                    onContextmenu: (event) => {
                        event.preventDefault();
                        useDiscreteApi().modal.create({
                            preset: 'card',
                            style: {
                                width: '800px',
                                height: '600px'
                            },
                            content: () => h(StockNews(item.Symbol, useConfig().value.keywords))
                        })
                    }
                }, h(MImage({
                    width: image_dimensions.width,
                    height: image_dimensions.height,
                    src: FinvizApi.Thumbnail_Image_Url(item.Symbol, theme, thumbnail_type),
                }))),
                footer: () => h(NButton, {
                    onClick: () => {
                        useConfig().value.finviz.ignore.push(item.Symbol);
                        Config.Save(useConfig().value);
                        array = array.filter(item => !useConfig().value.finviz.ignore.includes(item.Symbol));
                        useDiscreteApi().message.success(`${ignore_text} ${item.Symbol}`)
                    }
                }, () => ignore_text),
                action: () => `${item.Country} ${item.Volume}`
            }))
        }

        return array.length != 0 ? h(NSpace, {
            justify: 'center'
        }, () => result) : h(NEmpty, {
            description: 'No Data'
        });
    }

    const pagination = () => h(NFlex, {
        justify: 'end'
    }, () => h(NPagination, {
        showSizePicker: true,
        pageSizes: [12, 24, 36],
        page: page.value,
        pageSize: page_size.value,
        pageCount: Math.ceil(array.length / page_size.value),
        onUpdatePage: (newPage) => page.value = newPage,
        onUpdatePageSize: (newPageSize) => page_size.value = newPageSize
    }));

    return h(NFlex, {
        vertical: true,
    }, () => [content(), pagination()])
}