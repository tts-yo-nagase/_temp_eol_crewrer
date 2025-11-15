"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setInputValue("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value)
    } else {
      onChange([...selected, value])
    }
    // Keep dropdown open and refocus input
    setInputValue("")
    inputRef.current?.focus()
  }

  const selectables = options.filter((option) => !selected.includes(option.value))

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className="group border border-input rounded-md px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => setOpen(true)}
      >
        <div className="flex gap-1 flex-wrap items-center">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value)
            if (!option) return null
            return (
              <Badge
                key={value}
                variant="secondary"
                className="mr-0.2"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(value)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <input
            ref={inputRef}
            placeholder={selected.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setOpen(true)}
            className="ml-1 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[120px]"
          />
        </div>
      </div>
      {open && (
        <div className="relative">
          <div className="absolute w-full z-10 top-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <div className="max-h-[300px] overflow-y-auto p-1">
              {selectables
                .filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .length === 0 ? (
                <div className="py-6 text-center text-sm">No results found.</div>
              ) : (
                selectables
                  .filter((option) =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .map((option) => (
                    <div
                      key={option.value}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSelect(option.value)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    >
                      {option.label}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
