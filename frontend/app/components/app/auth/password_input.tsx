import { useState } from "react";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";

const is_reasonable = (value: string): boolean => {
  // 长度是否大于8个字符
  if (value.length < 8) {
    toast.error("The length of the password should be greater than 8.");
    return false;
  }
  // 不能包含空格
  if (value.includes(" ")) {
    toast.error("The password cannot contain Spaces.");
    return false;
  }
  return true;
};

interface PasswordInputProps {
  onConform: (value: string) => void;
  onError: () => void;
}

const PasswordInput = (props: PasswordInputProps) => {
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  return (
    <Input
      aria-invalid={invalid}
      value={password}
      type="password"
      onChange={(e) => setPassword(e.target.value)}
      onBlur={() => {
        const reasonable = is_reasonable(password);
        setInvalid(!reasonable);
        if (reasonable) {
          props.onConform(password);
        } else {
          props.onError();
        }
      }}
    />
  );
};

export default PasswordInput;
