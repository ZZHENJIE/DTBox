import { useNavigate } from "react-router";
import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "~/components/ui/menubar";

const CalendarMenu = () => {
  const navigate = useNavigate();

  return (
    <MenubarMenu>
      <MenubarTrigger>Calendar</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          {/*Economy*/}
          <MenubarSub>
            <MenubarSubTrigger>Economy</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => navigate("calendar/economy/finviz")}>
                Finviz
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          {/*IPO*/}
          <MenubarSub>
            <MenubarSubTrigger>IPO</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => navigate("calendar/ipo/scoop")}>
                Scoop
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          {/*Spac*/}
          <MenubarSub>
            <MenubarSubTrigger>SPAC</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => navigate("calendar/spac/research")}>
                Research
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default CalendarMenu;
