import { TextInput } from "@mantine/core";

interface ParameterValueInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ParameterValueInput({
  label,
  value,
  onChange,
}: ParameterValueInputProps) {
  return (
    <TextInput
      label={label}
      placeholder="参数值 (如 Technology)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
