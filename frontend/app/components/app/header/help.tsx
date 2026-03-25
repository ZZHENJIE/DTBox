import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Version } from "~/lib/API/Utils";

const Help = () => {
  const navigate = useNavigate();
  const [version, setVersion] = useState<string>();
  useEffect(() => {
    Version().then((value) => setVersion(value));
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Help</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate("about")}>
          About
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => open("https://github.com/ZZHENJIE/DTBox")}
        >
          GitHub
        </DropdownMenuItem>
        <DropdownMenuItem>{version}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Help;
