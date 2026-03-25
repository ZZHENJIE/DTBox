import Logo from "./logo";
import CalendarMenu from "./calendar_menu";
import ScreenerMenu from "./screener_menu";
import Search from "./search";
import Help from "./help";
import Auth from "~/components/app/auth";
import { ModeToggle } from "../theme/mode-toggle";
import { useEffect, useState } from "react";
import { Refresh } from "~/lib/API/User";
import JWTToken from "~/lib/JWTToken";
import User from "./user";
import { useNavigate } from "react-router";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    Refresh().then((response) => {
      if (response.ok()) {
        JWTToken.Set(response.data!);
        setIsLoggedIn(true);
      } else {
        JWTToken.Set("");
      }
    });
  }, []);
  return (
    <div className="flex fixed inset-x-0 left-1 right-1 items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
      <Logo />
      <Search />
      <CalendarMenu />
      <ScreenerMenu />
      <div className="flex ml-auto gap-2">
        {isLoggedIn ? <User /> : <Auth />}
        <ModeToggle />
        <Help />
      </div>
    </div>
  );
};

export default Header;
