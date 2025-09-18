import { h } from 'vue';
import { defineComponent } from 'vue';
import FlashNews from '../components/Futu/FlashNews';

export default defineComponent(() => {
    const render = () => h(FlashNews());

    return render;
});