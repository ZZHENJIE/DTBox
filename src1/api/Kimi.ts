import { MFetch } from "../utils/Tool";

async function Create_QRCode() {
    const url = 'https://www.kimi.com/api/user/wx/register_login';
    return MFetch(url, { method: 'POST' })
        .then(response => response.json())
        .catch(error => error);
}

async function QRCode_Status(id: string) {
    const url = `https://www.kimi.com/api/user/wx/register_login/${id}`;
    return MFetch(url, { method: 'GET' })
        .then(response => response.json())
        .catch(error => error);
}

async function Chat_List(token: string, offset: number = 0, size: number = 5) {
    const url = 'https://www.kimi.com/api/chat/list';
    return MFetch(url, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "offset": offset,
            "size": size
        })
    }).then(response => response.json())
        .catch(error => error);
}

async function Chat_Content(chat_id: string, token: string, last: number = 50) {
    const url = `https://www.kimi.com/api/chat/${chat_id}/segment/scroll`;
    return MFetch(url, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'last': last
        })
    }).then(response => response.json())
        .catch(error => error);
}

async function Create_Chat(token: string, chat_name: string = 'new chat') {
    const url = 'https://www.kimi.com/api/chat';
    return MFetch(url, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "name": chat_name,
            "born_from": "home",
            "kimiplus_id": "kimi",
            "is_example": false,
            "source": "web",
            "tags": []
        })
    }).then(response => response.json())
        .catch(error => error);
}

export default {
    Create_QRCode,
    QRCode_Status,
    Chat_List,
    Chat_Content,
    Create_Chat
}