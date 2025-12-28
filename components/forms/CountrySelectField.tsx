`use client`;
import { useMemo } from "react";
import countryList from "react-select-country-list";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Controller } from "react-hook-form";
import { Select, SelectItem, SelectTrigger } from "../ui/select";
import { SelectContent, SelectValue } from "@radix-ui/react-select";
const CountrySelectField = ({
  control,
  name,
  label,
  error,
  required,
}: CountrySelectProps) => {
  const options = useMemo(() => countryList().getData(), []);
  polyfillCountryFlagEmojis();
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <>
            <Popover>
              <Command className="bg-gray-800 border-gray-600">
                <PopoverTrigger className="country-select-trigger">
                  <span>{getFlagEmoji(field.value)} </span>
                  <span>
                    {options.find((c) => c.value === field.value)?.label}
                  </span>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
                  <CommandInput
                    className="country-select-input"
                    placeholder="Type a command or search..."
                  />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandList className="max-h-60 bg-gray-800 scrollbar-hide-default">
                    <CommandGroup className="bg-gray-800">
                      {options.map((option) => (
                        <CommandItem
                          className="country-select-item"
                          onSelect={() => {
                            field.onChange(option.value);
                          }}
                          key={option.value}
                          value={option.label}
                        >
                          <span>{getFlagEmoji(option.value)}</span>
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </PopoverContent>
              </Command>
            </Popover>
          </>
        )}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};
export default CountrySelectField;
