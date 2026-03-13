
import { useState } from "react";
import { Login as UserLogin } from "../utils/API/User";
import { ResponseToast } from "../utils/API/Core";

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Flex justify="center" direction="column" gap="3">
      <Box>
        <Text>Name</Text>
        <TextField.Root onChange={(event) => setName(event.target.value)} />
      </Box>
      <Box>
        <Text>Password</Text>
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
          disabled={!(name.length > 0 && password.length > 0)}
          onClick={() =>
            UserLogin(name, password).then((response) =>
              ResponseToast(response),
            )
          }
        >
          Confirm
        </Button>
      </Flex>
    </Flex>
  );
}

export default Login;
