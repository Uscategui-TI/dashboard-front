import Input from "./input/Input";
import Label from "./Label";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  type?: string;
};

export default function FormInput({ label, registration, error, type = "text" }: Props) {
  return (
    <div className="col-span-3">
      <Label className={error ? "text-red-600 dark:text-red-400" : ""}>{label}</Label>
      <Input type={type} placeholder={"Digite " + label} {...registration} className={error ? "border-red-500 dark:border-red-400" : ""} />
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error.message}</p>}
    </div>
  );
}
