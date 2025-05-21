
import { Controller, Control, FieldError } from "react-hook-form";
import Select from "./Select";
import Label from "./Label";

type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  control: Control<any>;
  options: Option[];
  placeholder: string;
  error?: FieldError;
  keyReset?: number;
};

export default function FormSelect({
  name,
  label,
  control,
  options,
  placeholder,
  error,
  keyReset,
}: Props) {
  return (
    <div className="col-span-3">
      <Label className={error ? "text-red-500 dark:text-red-400" : ""}>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{ required: "Este campo es obligatorio" }}
        render={({ field }) => (
          <Select
            key={keyReset}
            options={options}
            value={field.value !== null ? String(field.value) : undefined}
            onChange={(val: any) => field.onChange(val ? Number(val) : null)}
            placeholder={placeholder}
            className={error ? "border-red-500 dark:border-red-400" : ""}
          />
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error.message}</p>}
    </div>
  );
}
