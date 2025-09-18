type Language = 'zh-CN' | 'en-US';

export interface FinvizScreenerParameterItem {
    label: string,
    value: string
}

export interface AppConfig {
    is_dark_theme: boolean;
    keywords: string[],
    language: Language,
    finviz: {
        token: string,
        ignore: string[],
        screener_parameter: {
            parameter: string,
            auto_refresh: number,
            thumbnail_type: string
        },
        screener_parameter_list: FinvizScreenerParameterItem[],
    },
    kimi: {
        login_status: object | null,
        is_show_button: boolean,
    },
    time_window: {
        time_font_size: number,
        time_font_color: string
    }
}