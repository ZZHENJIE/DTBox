import { useState } from "react";
import { Exists, Register as UserRegister } from "../utils/API/User";
import { ResponseToast } from "../utils/API/Core";

function nameLegitimate(name: string) {
  return {
    length: name.length > 5,
    spaces_special: /^[a-zA-Z0-9_]+$/.test(name),
  };
}

function passwordLegitimate(password: string) {
  return {
    length: password.length > 7,
    spaces: !password.includes(" "),
  };
}

function is_enable(name: string, password: string) {
  const nameValid = nameLegitimate(name);
  const passwordValid = passwordLegitimate(password);
  return (
    nameValid.length &&
    nameValid.spaces_special &&
    passwordValid.length &&
    passwordValid.spaces
  );
}

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Flex justify="center" direction="column" gap="3">
      <Box>
        <Flex gap="3">
          <Text>Name</Text>
          <Badge color={nameLegitimate(name).length ? "green" : "red"}>
            Length Greater Than 5
          </Badge>
          <Badge color={nameLegitimate(name).spaces_special ? "green" : "red"}>
            Spaces and special characters cannot be used
          </Badge>
        </Flex>
        <TextField.Root
          onBlur={() => {
            // 查询用户是否存在
            const legitimate = nameLegitimate(name);
            if (legitimate.length && legitimate.spaces_special) {
              Exists(name).then((response) => {
                const data = response.value.data!;
                if (data) {
                  alert("Name already exists.");
                }
              });
            }
          }}
          onChange={(event) => setName(event.target.value)}
        />
      </Box>
      <Box>
        <Flex gap="3">
          <Text>Password</Text>
          <Badge color={passwordLegitimate(password).length ? "green" : "red"}>
            Length Greater Than 7
          </Badge>
          <Badge color={passwordLegitimate(password).spaces ? "green" : "red"}>
            Spaces characters cannot be used
          </Badge>
        </Flex>
        <TextField.Root
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />
      </Box>
      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          disabled={!is_enable(name, password)}
          onClick={() => {
            UserRegister(name, password).then((response) => {
              ResponseToast(response);
            });
          }}
        >
          Confirm
        </Button>
      </Flex>
    </Flex>
  );
}

export default Register;
