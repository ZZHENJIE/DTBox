import { useState } from "react";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { ResponseToast } from "~/lib/API/Core";
import { Exists } from "~/lib/API/User";

const is_reasonable = async (value: string) => {
  // 长度是否大于5个字符
  if (value.length < 5) {
    toast.error("The length of the name should be greater than 5.");
    return false;
  }
  // 不能包含特殊字符与空格
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    toast.error(
      "The name cannot contain special characters and can only be underlined.",
    );
    return false;
  }
  // 请求查询用户名是否已经存在
  const response = await Exists(value);
  if (response.value.code != 0) {
    ResponseToast(response);
    return false;
  }
  if (response.value.data == true) {
    toast.error(`The name "${value}" already exists`);
    return false;
  }
  return true;
};

interface NameInputProps {
  onConform: (value: string) => void;
  onError: () => void;
}

const NameInput = (props: NameInputProps) => {
  const [name, setName] = useState("");
  const [invalid, setInvalid] = useState(false);
  return (
    <Input
      aria-invalid={invalid}
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={() =>
        is_reasonable(name).then((reasonable) => {
          setInvalid(!reasonable);
          if (reasonable) {
            props.onConform(name);
          } else {
            props.onError();
          }
        })
      }
    />
  );
};

export default NameInput;
