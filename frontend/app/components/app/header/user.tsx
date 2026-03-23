import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ResponseToast } from "~/lib/API/Core";
import { Info, Logout } from "~/lib/API/User";
import UserInfo from "~/lib/UserInfo";

const User = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("DTBox");
  useEffect(() => {
    Info().then((response) => {
      if (response.value.code == 0) {
        UserInfo.Set(response.value.data!);
        setName((UserInfo.Get() as any).name.slice(0, 2));
      } else {
        ResponseToast(response);
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
                if (response.value.code == 0) {
                  location.reload();
                } else {
                  ResponseToast(response);
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
