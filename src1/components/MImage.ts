import { NImage, NSkeleton, type ImageProps } from 'naive-ui';
import { defineComponent, h, ref } from 'vue';
import { MFetch } from '../utils/Tool';

export default (options: ImageProps) => {
    return defineComponent(() => {
        const is_loading = ref(true);
        const image_src = ref('');

        const url = options.src;
        if (url) {
            MFetch(url).then(response => response.blob().then(blob => {
                image_src.value = URL.createObjectURL(blob);
                is_loading.value = false;
            }))
        }

        const skeleton = () => h(NSkeleton, {
            width: options.width,
            height: options.height,
            sharp: false
        });

        const image = () => h(NImage, {
            ...options,
            src: image_src.value
        });

        return () => is_loading.value ? skeleton() : image()
    });
}