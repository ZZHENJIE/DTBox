
import Login from "./Login";
import Register from "./Register";

function Auth() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Auth</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Auth</Dialog.Title>
        <Dialog.Description>Welcome to using DTBox 😊</Dialog.Description>
        <Tabs.Root defaultValue="login">
          <Tabs.List>
            <Tabs.Trigger value="login">Login</Tabs.Trigger>
            <Tabs.Trigger value="register">Register</Tabs.Trigger>
          </Tabs.List>

          <Box pt="2">
            <Tabs.Content value="login">
              <Login></Login>
            </Tabs.Content>

            <Tabs.Content value="register">
              <Register></Register>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default Auth;
