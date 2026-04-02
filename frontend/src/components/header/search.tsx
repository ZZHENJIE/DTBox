import { Autocomplete } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export const Search = () => {
  return (
    <Autocomplete
      leftSection={<IconSearch size={16} stroke={1.5} />}
      placeholder="Search"
      data={[
        "AMD",
        "MSFT",
        "AAPL",
        "GOOGL",
        "AMZN",
        "TSLA",
        "META",
        "NFLX",
        "INTC",
        "PYPL",
        "CSCO",
        "ADBE",
        "ORCL",
        "IBM",
        "QCOM",
        "NVDA",
      ]}
    />
  );
};

export default Search;
