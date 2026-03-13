
import { useNavigate } from "react-router";
import Auth from "./Auth";

function Logo() {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      gap="2"
      style={{ cursor: "pointer" }}
      onClick={() => navigate("/")}
    >
      <img width="32" height="32" src="/image/dtbox.svg" alt="Logo" />
      <Text size="5" weight="bold">
        DTBox
      </Text>
    </Flex>
  );
}

function SearchBox() {
  return (
    <TextField.Root placeholder="Search the symbol.">
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
    </TextField.Root>
  );
}

function Menu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft">
          Options
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item shortcut="⌘ N">Archive</DropdownMenu.Item>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
            <DropdownMenu.Item>Move to folder…</DropdownMenu.Item>

            <DropdownMenu.Separator />
            <DropdownMenu.Item>Advanced options…</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />
        <DropdownMenu.Item>Share</DropdownMenu.Item>
        <DropdownMenu.Item>Add to favorites</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item shortcut="⌘ ⌫" color="red">
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function About() {
  const navigate = useNavigate();
  return <Button onClick={() => navigate("/about")}>About</Button>;
}

function AppHeader() {
  return (
    <Card
      style={{
        position: "fixed",
        top: 5,
        left: 5,
        right: 5,
        zIndex: 100,
      }}
    >
      <Flex align="center" justify="between">
        <Flex gap="4">
          <Logo />
          <SearchBox />
        </Flex>
        <Menu />
        <Flex gap="2">
          <Auth />
          <IconButton
            onClick={() => open("https://github.com/ZZHENJIE/DTBox")}
            color="green"
          >
            <GitHubLogoIcon></GitHubLogoIcon>
          </IconButton>
          <About />
        </Flex>
      </Flex>
    </Card>
  );
}

export default AppHeader;
