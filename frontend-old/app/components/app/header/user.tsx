import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Info, Logout } from "~/lib/API/User";
import { setUserInfo } from "~/lib/UserInfo";

const User = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("DTBox");
  useEffect(() => {
    Info().then((response) => {
      if (response.ok()) {
        const data = response.data!;
        setUserInfo(data);
        setName(data.name.slice(0, 2));
      }
    });
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full" size="icon">
          <Avatar>
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("profile")}>
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              Logout().then((response) => {
                if (response.ok()) {
                  location.reload();
                }
              });
            }}
            variant="destructive"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default User;
