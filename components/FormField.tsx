import React from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormItem>
        {label && (
          <FormLabel className="text-white text-sm font-medium">
            {label}
          </FormLabel>
        )}
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            className="
              w-full px-4 py-3 rounded-xl border border-white/30
              bg-white/10 text-white placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              transition-all duration-200 backdrop-blur-md
              selection:bg-blue-500/40 selection:text-white
            "
          />
        </FormControl>
        <FormMessage className="text-red-300 text-xs mt-1" />
      </FormItem>
    )}
  />
);

export default FormField;
