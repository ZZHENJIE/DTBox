<script lang="js">
import Cboe from '../api/Cboe';

function handle_item(data) {
    const result = data;
    if (data.asks.length === 0) {
        result.asks.push([
            'Null', 'Null'
        ])
    }
    if (data.bids.length === 0) {
        result.bids.push([
            'Null', 'Null'
        ])
    }
    return result;
}

class MarketBook {
    constructor(market) {
        this.market = market;
        this.data = null;
        this.timer = null;
        this.uc_market = market.toUpperCase();
    }

    async fetchData(symbol) {
        try {
            const response = await Cboe.Book_Viewer(symbol, this.market);
            this.data = handle_item(JSON.parse(response).data);
        } catch (error) {
            console.error(`${this.market}请求失败:`, error);
        }
    }
}

export default {
    data() {
        return {
            isLoop: false,
            symbol: null,
            markets: ['bzx', 'byx', 'edgx', 'edga'],
            books: []
        }
    },
    created() {
        this.books = this.markets.map(m => new MarketBook(m));
    },
    unmounted() {
        this.stopAllRequests();
    },
    methods: {
        confirm() {
            if (!this.symbol) return;
            this.stopAllRequests();
            this.isLoop = true;
            this.startPolling();
        },

        startPolling() {
            this.books.forEach(book => {
                const fetch = async () => {
                    if (!this.isLoop) return;
                    await book.fetchData(this.symbol);
                    book.timer = setTimeout(fetch, 1000);
                };
                fetch();
            });
        },

        stopAllRequests() {
            this.isLoop = false;
            this.books.forEach(book => {
                if (book.timer) {
                    clearTimeout(book.timer);
                    book.timer = null;
                }
            });
        },

        isShow() {
            let show = true;
            for (let index = 0; index < this.books.length; index++) {
                if (this.books[index].data === null) {
                    show = false;
                    break;
                }
            }
            return show;
        }
    },
    watch: {
        symbol() {
            this.stopAllRequests();
        }
    }
}
</script>

<template>
    <n-flex vertical>
        <n-space>
            <n-input maxlength="10" @input="isLoop = false" v-model:value="symbol" type="text" placeholder="Symbol" />
            <n-button @click="confirm">Confirm</n-button>
        </n-space>
        <n-flex justify="center">
            <n-table>
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Update Time</th>
                        <th>Market</th>
                        <th>Price</th>
                        <th>Size</th>
                        <th>Deep</th>
                    </tr>
                </thead>
                <tbody v-if="isShow()">
                    <tr v-for="item in books">
                        <td>{{ item.uc_market }}</td>
                        <td>{{ item.data.bids[0][1] }}</td>
                        <td>{{ item.data.bids[0][0] }}</td>
                        <td>{{ item.data.timestamp }}</td>
                        <td>{{ item.uc_market }}</td>
                        <td>{{ item.data.asks[0][1] }}</td>
                        <td>{{ item.data.asks[0][0] }}</td>
                        <td>
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    <n-button>Viewer</n-button>
                                </template>
                                <n-space>
                                    <n-table>
                                        <thead>
                                            <tr>
                                                <th>Price</th>
                                                <th>Size</th>
                                            </tr>
                                        </thead>
                <tbody>
                    <tr v-for="bids_item in item.data.bids">
                        <td>{{ bids_item[1] }}</td>
                        <td>{{ bids_item[0] }}</td>
                    </tr>
                </tbody>
            </n-table>
            <n-table>
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="asks_item in item.data.asks">
                        <td>{{ asks_item[1] }}</td>
                        <td>{{ asks_item[0] }}</td>
                    </tr>
                </tbody>
            </n-table>
            </n-space>

            </n-tooltip>
            </td>
            </tr>
            </tbody>
            </n-table>
        </n-flex>
    </n-flex>
</template>