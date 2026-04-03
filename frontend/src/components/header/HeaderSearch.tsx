import { Autocomplete } from "@mantine/core";

const searchData = [
  "Tool 1",
  "Tool 2",
  "About",
  "Home",
  "Chart",
  "Profile",
  "Settings",
];

function HeaderSearch() {
  return <Autocomplete placeholder="Search..." w={200} data={searchData} />;
}

export default HeaderSearch;
