import { Button } from "~/components/ui/button";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const Login = () => {
  return (
    <FieldGroup>
      <Field>
        <Label>Name</Label>
        <Input />
      </Field>
      <Field>
        <Label>Password</Label>
        <Input type="password" />
      </Field>
      <Button>Login</Button>
    </FieldGroup>
  );
};

export default Login;
