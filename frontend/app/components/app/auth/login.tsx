import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Login as UserLogin } from "~/lib/API/User";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <FieldGroup>
      <Field>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Button
        disabled={!(name.length > 0 && password.length > 0)}
        onClick={() =>
          UserLogin(name, password).then((response) => {
            if (response.ok()) {
              location.reload();
            }
          })
        }
      >
        Login
      </Button>
    </FieldGroup>
  );
};

export default Login;
