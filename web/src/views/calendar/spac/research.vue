<template>
    <NLayout
        position="absolute"
        content-style="padding: 8px;"
        :native-scrollbar="false"
    >
        <NSpin :show="is_loading">
            <NTable :single-line="false">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Event</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in result">
                        <td>{{ item.symbol }}</td>
                        <td>{{ item.event }}</td>
                        <td>{{ item.date }}</td>
                    </tr>
                </tbody>
            </NTable>
        </NSpin>
    </NLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Calendar } from "../../../utils/api";
import { useNotification } from "naive-ui";

interface Item {
    date: string;
    event: string;
    symbol: string;
}

const notification = useNotification();
const calendar = new Calendar(notification);
const result = ref<Item[]>([]);
const is_loading = ref(true);
const refresh = async () => {
    is_loading.value = true;
    const json = await calendar.SPAC_Research((_) => {
        is_loading.value = false;
    });
    result.value = json;
};

onMounted(() => refresh());
</script>
