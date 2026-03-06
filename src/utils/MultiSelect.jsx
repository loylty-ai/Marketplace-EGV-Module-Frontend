import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

export default function MultiSelect({
  id,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = "Select option",
  disabled = false,
  required = false,
  label,
  error
}) {

  const [open, setOpen] = useState(false)

  const toggleOption = (optionValue) => {

    let newValue

    if (value.includes(optionValue)) {
      newValue = value.filter(v => v !== optionValue)
    } else {
      newValue = [...value, optionValue]
    }

    onChange(newValue, { name })
  }

  const removeOption = (optionValue) => {
    const newValue = value.filter(v => v !== optionValue)
    onChange(newValue, { name })
  }

  const selectedOptions = options.filter(o => value.includes(o.value))

  return (
    <div className="w-full space-y-1">

      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>

          <Button
            id={id}
            name={name}
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between min-h-[40px] h-auto"
          >

            <div className="flex flex-wrap gap-1 max-w-[90%]">

              {selectedOptions.length > 0 ? (

                selectedOptions.map(option => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {option.label}

                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOption(option.value)
                      }}
                    />

                  </Badge>
                ))

              ) : (
                <span className="text-muted-foreground">
                  {placeholder}
                </span>
              )}

            </div>

            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

          </Button>

        </PopoverTrigger>

        <PopoverContent className="w-full p-0">

          <Command>

            <CommandInput placeholder="Search..." />

            <CommandList>

              <CommandEmpty>No option found.</CommandEmpty>

              {options.map(option => (

                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                >

                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />

                  {option.label}

                </CommandItem>

              ))}

            </CommandList>

          </Command>

        </PopoverContent>

      </Popover>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

    </div>
  )
}