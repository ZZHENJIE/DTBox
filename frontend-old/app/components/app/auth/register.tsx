import { Button } from "~/components/ui/button";
import { Field, FieldGroup } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import NameInput from "./name_input";
import PasswordInput from "./password_input";
import { useState } from "react";
import { Register as UserRegister } from "~/lib/API/User";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState({
    value: "",
    isError: true,
  });
  const [password, setPassword] = useState({
    value: "",
    isError: true,
  });
  return (
    <FieldGroup>
      <Field>
        <Label>Name</Label>
        <NameInput
          onError={() =>
            setName({
              ...name,
              isError: true,
            })
          }
          onConform={(value) =>
            setName({
              value,
              isError: false,
            })
          }
        />
      </Field>
      <Field>
        <Label>Password</Label>
        <PasswordInput
          onError={() =>
            setPassword({
              ...password,
              isError: true,
            })
          }
          onConform={(value) =>
            setPassword({
              value,
              isError: false,
            })
          }
        />
      </Field>
      <Button
        disabled={name.isError || password.isError}
        onClick={() =>
          UserRegister(name.value, password.value).then((response) => {
            if (response.ok()) {
              toast.success("Successfully registered!");
            }
          })
        }
      >
        Register
      </Button>
    </FieldGroup>
  );
};

export default Register;
