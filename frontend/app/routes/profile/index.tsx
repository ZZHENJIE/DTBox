import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Card, CardContent } from "~/components/ui/card";
import { getUserInfo } from "~/lib/UserInfo";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useEffect, useState } from "react";
import type { UserInfo } from "~/lib/API/User";

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
  const [info, setInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    setInfo(getUserInfo());
  }, []);

  return (
    <div className="flex justify-center pt-10">
      <Card className="w-full">
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>
                Name
                <Button variant="outline">Change</Button>
              </FieldLabel>
              <Badge variant="secondary">{info?.name}</Badge>
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
                {permissions_to_string(info?.permissions!)}
              </Badge>
            </Field>
            <Field>
              <FieldLabel>Create Time</FieldLabel>
              <Badge variant="secondary">{info?.create_time}</Badge>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
