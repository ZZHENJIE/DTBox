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
                        <th>Company</th>
                        <th>Managers</th>
                        <th>Shares(Millions)</th>
                        <th>Price Low</th>
                        <th>Price High</th>
                        <th>Expected Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in result">
                        <td>{{ item.symbol }}</td>
                        <td>{{ item.company }}</td>
                        <td>{{ item.managers }}</td>
                        <td>{{ item.shares_millions }}</td>
                        <td>{{ item.price_low }}</td>
                        <td>{{ item.price_high }}</td>
                        <td>{{ item.expected_date }}</td>
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
    company: string;
    expected_date: string;
    managers: string;
    price_high: string;
    price_low: string;
    shares_millions: string;
    symbol: string;
}

const notification = useNotification();
const calendar = new Calendar(notification);
const result = ref<Item[]>([]);
const is_loading = ref(true);
const refresh = async () => {
    is_loading.value = true;
    const json = await calendar.IPO_Iposcoop((_) => {
        is_loading.value = false;
    });
    result.value = json;
};

onMounted(() => refresh());
</script>
