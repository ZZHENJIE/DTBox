<script lang='ts'>
import { NButton, NInput, NInputGroup, NList, NListItem, NScrollbar } from 'naive-ui';
import { defineComponent, type PropType } from 'vue';
import type { DiscreteApi } from 'naive-ui';

export default defineComponent({
    props: {
        keywords: {
            type: Array as PropType<string[]>,
            required: true,
        },
        discreteapi: {
            type: Object as PropType<DiscreteApi>,
            required: true,
        },
    },
    emits: ['UpdateKeywords'],
    data() {
        return {
            new_keyword: '',
        };
    },
    methods: {
        add_keyword() {
            if (!this.new_keyword.trim()) return;

            const alreadyExists = this.keywords.some(k => k === this.new_keyword);
            if (alreadyExists) {
                this.discreteapi.message.warning(`关键词 "${this.new_keyword}" 已存在`);
            } else {
                this.$emit('UpdateKeywords', [...this.keywords, this.new_keyword]);
                this.discreteapi.message.success(`成功添加关键词: ${this.new_keyword}`);
                this.new_keyword = '';
            }
        },
        delete_keyword(keyword: string) {
            this.$emit('UpdateKeywords', this.keywords.filter(k => k !== keyword));
        },
    },
});
</script>

<template>
    <NInputGroup>
        <NInput v-model:value="new_keyword"></NInput>
        <NButton type="primary" ghost @click="add_keyword">Add</NButton>
    </NInputGroup>
    <NScrollbar style="max-height: 400px">
        <NList>
            <NListItem v-for="keyword in keywords">
                <template #prefix>
                    <NButton @click="delete_keyword(keyword)">Delete</NButton>
                </template>
                {{ keyword }}
            </NListItem>
        </NList>
    </NScrollbar>
</template>