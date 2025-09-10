import { MFetch } from "../utils/Tool";
import { type IPOItem } from "./Type";
async function Calendar() {
    const url = 'https://www.iposcoop.com/ipo-calendar/';
    const response = await MFetch(url, { method: 'GET' });
    const html = await response.text();
    const parser = new DOMParser();
    const result: IPOItem[] = [];
    const doc = parser.parseFromString(html, 'text/html');
    const tbody = doc.querySelector("tbody");

    if (!tbody) {
        return result;
    }

    const trElements = tbody.querySelectorAll("tr");

    trElements.forEach((tr) => {
        const tds = tr.querySelectorAll("td");
        const item: IPOItem = {
            Company: tds[0].textContent?.trim() || "",
            Symbol: tds[1].textContent?.trim() || "",
            Managers: tds[2].textContent?.trim() || "",
            Shares_Millions: tds[3].textContent?.trim() || "",
            Price: `${tds[4].textContent?.trim()}-${tds[5].textContent?.trim()}` || "",
            Estimated_Dollar_Volume: tds[6].textContent?.trim() || "",
            Estimated_Date: tds[7].textContent?.trim() || "",
        };
        result.push(item);
    });

    return result;
}

export default {
    Calendar
}