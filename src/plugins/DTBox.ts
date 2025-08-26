import { computed, ref, type App } from 'vue'
import FutuApi from '../api/Futu'
import { invoke } from '@tauri-apps/api/core'
import Config from '../utils/Config';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';

export function Init() {
    return new Promise((resolve, reject) => {
        FutuApi.Stock_Id_CSV().then(csv => {
            invoke('update_stock_id_csv', { csvText: csv })
                .then(() => resolve(true))
                .catch(error => reject(error));
        }).catch(error => reject(error));
    })
}

declare module 'vue' {
    interface ComponentCustomProperties {

    }
}

const config_ref = ref(Config.Get());

export const provider_props_ref = computed<ConfigProviderProps>(() => ({
    theme: config_ref.value.is_dark_theme ? darkTheme : lightTheme
}))

const discrete_api = createDiscreteApi(['loadingBar', 'message', 'modal', 'notification'], {
    configProviderProps: provider_props_ref
});

export const useConfig = () => config_ref;
export const useDiscreteApi = () => discrete_api;

export default {
    install(app: App) {

    }
}