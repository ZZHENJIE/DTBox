import './plugins/Tauri';
import { createApp } from 'vue';
import App from './App';
// Plugins
import DTBox from './plugins/DTBox';
import { Router } from './plugins/Router';
import { i18n } from './plugins/I18n';

// @ts-ignore
import './assets/App.css'

const app = createApp(App);
app.use(i18n);
app.use(DTBox.install);
app.use(Router);
app.mount('#app');
