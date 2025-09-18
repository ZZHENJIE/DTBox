import { NEllipsis, type EllipsisProps } from "naive-ui";
import { h } from "vue";

export default (text: string, options: EllipsisProps = {
    lineClamp: 1
}) => {
    return h(NEllipsis, options, () => text);
}