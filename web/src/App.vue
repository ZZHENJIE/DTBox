<template>
    <button @click="resetConfig">Reset Config</button>
</template>

<script lang="js">
import { defineComponent } from "vue";
import { getConfig, resetConfig } from "./utils/config";

export default defineComponent({
    data() {
        return {
            config: {},
            resetConfig,
        };
    },
    methods: {},
    async mounted() {
        this.config = getConfig();
        const response = await fetch("/api/user/get", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.config.user),
        });
        if (response.status != 200) {
            const data = await response.json();
            alert(JSON.stringify(data));
        }
    },
});
</script>
