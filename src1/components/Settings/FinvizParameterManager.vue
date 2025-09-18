<script lang='ts'>
import { defineComponent, type PropType } from 'vue';
import type { FinvizScreenerParameterItem } from '../../utils/Config';

export default defineComponent({
    props: {
        parameter: {
            type: Array as PropType<FinvizScreenerParameterItem[]>,
            required: true,
        }
    },
    emits: ['UpdateParameter'],
    data() {
        return {
            parameter_copy: [] as {
                key: string,
                value: string
            }[]
        }
    },
    methods: {
        parameter_copy_change(value: any) {
            const parameter = [] as FinvizScreenerParameterItem[];
            for (const item of value) {
                parameter.push({
                    label: item.key,
                    value: item.value
                })
            }
            this.$emit('UpdateParameter', parameter);
        }
    },
    mounted() {
        this.parameter_copy = [];
        for (const item of this.parameter) {
            this.parameter_copy.push({
                key: item.label,
                value: item.value
            });
        }
    },
})

</script>

<template>
    <NDynamicInput v-model:onUpdateValue="parameter_copy_change" v-model:value="parameter_copy" preset="pair"
        show-sort-button key-placeholder="Parameter Label" value-placeholder="Parameter Value">
    </NDynamicInput>
</template>