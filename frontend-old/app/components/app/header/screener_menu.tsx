import { useNavigate } from "react-router";
import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "~/components/ui/menubar";

const ScreenerMenu = () => {
  const navigate = useNavigate();

  return (
    <MenubarMenu>
      <MenubarTrigger>Screener</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarItem
            onClick={() => {
              navigate("screener/finviz");
            }}
          >
            Finviz
          </MenubarItem>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ScreenerMenu;
