<template>
    <NLayout position="absolute" has-sider>
        <NLayout content-style="padding: 8px;" :native-scrollbar="false">
            <NSpin :show="news_is_loading">
                <NList hoverable clickable>
                    <NListItem
                        v-for="item in news_result"
                        @click="openUrl(item.Url)"
                    >
                        <NThing :title="item.Title">
                            <template #description>
                                <NSpace size="small" style="margin-top: 4px">
                                    <NTag round type="info">
                                        {{ item.Source }}
                                    </NTag>
                                </NSpace>
                            </template>
                            {{ item.Date }}
                        </NThing>
                    </NListItem>
                </NList>
            </NSpin>
        </NLayout>
        <NLayout-sider
            content-style="padding: 24px;"
            :native-scrollbar="false"
            bordered
        >
        </NLayout-sider>
    </NLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useNotification } from "naive-ui";
import api_fetch from "../utils/api_fetch";
import { openUrl } from "../utils/tool";

export interface News_Item {
    Title: string;
    Source: string;
    Date: string;
    Url: string;
    Category: string;
}

const notification = useNotification();
const news_result = ref<News_Item[]>([]);
const news_is_loading = ref(true);
const news_refresh = async () => {
    news_is_loading.value = true;
    const json = await api_fetch(
        "/api/event/finviz",
        {
            News: null,
        },
        notification,
        (_) => {
            news_is_loading.value = false;
        },
    );
    news_result.value = json.Common;
};

onMounted(() => news_refresh());
</script>
