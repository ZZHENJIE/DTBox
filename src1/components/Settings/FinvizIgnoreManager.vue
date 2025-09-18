<script lang='ts'>
import { NButton, NInput, NInputGroup, NList, NListItem, NScrollbar } from 'naive-ui';
import { defineComponent, type PropType } from 'vue';
import type { DiscreteApi } from 'naive-ui';

export default defineComponent({
    props: {
        ignore: {
            type: Array as PropType<string[]>,
            required: true,
        },
        discreteapi: {
            type: Object as PropType<DiscreteApi>,
            required: true,
        },
    },
    emits: ['UpdateIgnore'],
    data() {
        return {
            new_ignore: '',
        };
    },
    methods: {
        add_ignore() {
            if (!this.new_ignore.trim()) return;

            const alreadyExists = this.ignore.some(k => k === this.new_ignore);
            if (alreadyExists) {
                this.discreteapi.message.warning(`关键词 "${this.new_ignore}" 已存在`);
            } else {
                this.$emit('UpdateIgnore', [...this.ignore, this.new_ignore]);
                this.discreteapi.message.success(`成功添加股票: ${this.new_ignore}`);
                this.new_ignore = '';
            }
        },
        delete_ignore(ignore: string) {
            this.$emit('UpdateIgnore', this.ignore.filter(k => k !== ignore));
        }
    },
});
</script>

<template>
    <NInputGroup>
        <NButton @click="$emit('UpdateIgnore', [])">Clear</NButton>
        <NInput v-model:value="new_ignore"></NInput>
        <NButton type="primary" ghost @click="add_ignore">Add</NButton>
    </NInputGroup>
    <NScrollbar style="max-height: 400px">
        <NList>
            <NListItem v-for="ignore in ignore">
                <template #prefix>
                    <NButton @click="delete_ignore(ignore)">Delete</NButton>
                </template>
                {{ ignore }}
            </NListItem>
        </NList>
    </NScrollbar>
</template>