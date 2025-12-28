import { Controller } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const SelectField = ({
  control,
  label,
  name,
  options,
  placeholder,
  error,
  required,
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-gray-700 focus:text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message}</p>
            )}
          </Select>
        )}
      />
    </div>
  );
};

export default SelectField;
