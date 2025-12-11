import type { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

class API {
  notification: NotificationApiInjection;

  constructor(notification: NotificationApiInjection) {
    this.notification = notification;
  }

  async post(
    url: string,
    body: object = {},
    response_done: (response: Response) => void = () => {},
  ) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    response_done(response);
    const text = await response.text();

    if (!response.ok) {
      this.notification.error({
        title: "Fetch Error",
        content: text,
        meta: new Date().toLocaleString(),
      });
      return {};
    }

    return JSON.parse(text);
  }
}

export class Calendar extends API {
  constructor(notification: NotificationApiInjection) {
    super(notification);
  }

  async IPO_Iposcoop(response_done: (response: Response) => void = () => {}) {
    return await this.post("/api/calendar/ipo/iposcoop", {}, response_done);
  }

  async SPAC_Research(response_done: (response: Response) => void = () => {}) {
    return await this.post("/api/calendar/spac/research", {}, response_done);
  }
}

export class Event extends API {
  constructor(notification: NotificationApiInjection) {
    super(notification);
  }

  async Finviz(
    event: "News" | "Blogs" | "Stock" | "ETF",
    response_done: (response: Response) => void = () => {},
    symbol: string | null = null,
  ) {
    const body = { [event]: symbol };
    return await this.post("/api/event/finviz", body, response_done);
  }
}
