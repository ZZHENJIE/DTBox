import { MFetch } from "../utils/Tool";

async function Calendar(start: number, end: number) {
    const url = `https://api-one-wscn.awtmt.com/apiv1/finance/macrodatas?start=${start}&end=${end}`;
    return MFetch(url, { method: 'GET' })
        .then(response => response.json())
        .catch(error => error);
}

export default {
    Calendar
}