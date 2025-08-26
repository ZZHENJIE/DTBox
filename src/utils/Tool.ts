import { fetch, type ClientOptions } from "@tauri-apps/plugin-http";
import { useDiscreteApi } from "../plugins/DTBox";
export function MFetch(input: URL | Request | string, init?: RequestInit & ClientOptions): Promise<Response> {
    return new Promise((resolve, reject) => fetch(input, init)
        .then(response => {
            if (!response.ok) {
                useDiscreteApi().message.error(`Status: ${response.status}`, {
                    duration: 3000
                });
            }
            resolve(response);
        })
        .catch(error => {
            useDiscreteApi().message.error(`MFetch: ${error}`, {
                duration: 3000
            });
            reject(error);
        }));
}
async function Akamai_Timestamp() {
    const url = 'https://time.akamai.com';
    return fetch(url, { method: 'GET' }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
}

function Url_Params_Insert(url: string, params: object) {
    const Url = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
        Url.searchParams.set(key, value);
    });
    return Url;
}

export default {
    Akamai_Timestamp,
    Url_Params_Insert
}