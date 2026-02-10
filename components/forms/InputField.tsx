import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

const InputField = ({ name, label, placeholder, type = "text", register, error, validation, disabled, value, className }: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        {...register(name, validation)}
        className={cn("form-input", className, {
          "opacity-50 cursor-not-allowed": disabled,
        })}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
export default InputField
