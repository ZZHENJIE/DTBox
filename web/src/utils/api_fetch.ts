import type { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

export default async (
  url: string,
  body: object = {},
  notification: NotificationApiInjection | null = null,
  response_done: (res: Response) => void = () => {},
) => {
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
    if (notification) {
      notification.error({
        title: "Fetch Error",
        content: text,
        meta: new Date().toLocaleString(),
      });
    }
    return {};
  }

  return JSON.parse(text);
};
