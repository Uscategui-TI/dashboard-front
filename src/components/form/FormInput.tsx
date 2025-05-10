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
      <Label className={error ? "text-red-600" : ""}>{label}</Label>
      <Input type={type} {...registration} className={error ? "border-red-500" : ""} />
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
    </div>
  );
}
