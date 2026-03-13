import Logo from "./logo";
import Menu from "./menu";
import Search from "./search";
import Help from "./help";
import Auth from "~/components/app/auth";
import { ModeToggle } from "../theme/mode-toggle";

const Header = () => {
  return (
    <div className="flex fixed inset-x-0 left-1 right-1 items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
      <Logo />
      <Search />
      <Menu />
      <div className="flex ml-auto gap-2">
        <Auth />
        <ModeToggle />
        <Help />
      </div>
    </div>
  );
};

export default Header;
