import { Controller } from "react-hook-form";
import Label from "./Label";
import Select from "./Select"; // este es tu <select> personalizado

type Option = { label: string; value: number };

type Props = {
  name: string;
  label?: string;
  control: any;
  options: Option[];
  placeholder?: string;
  error?: any;
  keyReset?: number;
};

export default function FormSelectNumber({
  name,
  label,
  control,
  options,
  placeholder,
  error,
  keyReset,
}: Props) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <Controller
        name={name}
        control={control}
        key={keyReset}
        render={({ field }) => (
            <Select
                options={options.map(opt => ({ ...opt, value: String(opt.value) }))}
                value={String(field.value ?? "")}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    field.onChange(Number(e.target.value))
                }
                placeholder={placeholder}
            />

        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
