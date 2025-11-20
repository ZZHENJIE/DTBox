<template>
    <div style="text-align: center">
        <button @click="test_fetch">Test</button>
    </div>
</template>

<script lang="js">
import { defineComponent } from "vue";

export default defineComponent({
    data() {
        return {};
    },
    methods: {
        async test_fetch() {
            const user = await fetch("/api/test1");
            alert(await user.text());
        },
    },
});
</script>
