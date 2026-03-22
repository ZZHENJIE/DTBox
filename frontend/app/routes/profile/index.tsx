import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import UserInfo from "~/lib/UserInfo";
import JWTToken from "~/lib/JWTToken";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const permissions_to_string = (perms: number) => {
  switch (perms) {
    case 1:
      return "Member";
    case 2:
      return "Administrator";
    default:
      return "Ordinary";
  }
};

const Profile = () => {
  const info = UserInfo.Get() as any;

  return (
    <div className="flex justify-center pt-10">
      <Card className="">
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>
                Name
                <Button variant="outline">Change</Button>
              </FieldLabel>
              <Badge variant="secondary">{info.name}</Badge>
            </Field>
            <Field>
              <FieldLabel>
                Password
                <Button variant="outline">Change</Button>
              </FieldLabel>
              <Badge variant="secondary">********</Badge>
            </Field>
            <Field>
              <FieldLabel>Permissions</FieldLabel>
              <Badge variant="secondary">
                {permissions_to_string(info.permissions)}
              </Badge>
            </Field>
            <Field>
              <FieldLabel>Create Time</FieldLabel>
              <Badge variant="secondary">{info.create_time}</Badge>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">
            Please do not refresh this page, otherwise the information will not
            be rendered.
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
