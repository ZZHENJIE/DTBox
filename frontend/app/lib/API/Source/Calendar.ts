import { Post } from "../Core";

const EconomyFinviz = async (begin: string, end: string) => {
  const response = await Post<object>("/api/calendar/economy/finviz", {
    begin,
    end,
  });
  return response;
};
