import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { wards } from "@/data/wards";

interface WardSelectorProps {
    value: number | undefined;
    onChange: (value: number) => void;
    className?: string;
}

export function WardSelector({ value, onChange, className }: WardSelectorProps) {
    const [open, setOpen] = useState(false);

    // We only show a subset of wards initially for performance, or filter by search
    // Since we have 250 wards, we'll let Command handle the filtering but maybe limit rendering if needed.
    // shadcn/cmdk handles basic lists well.

    const selectedWard = wards.find((ward) => ward.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedWard
                        ? `Ward ${selectedWard.id}: ${selectedWard.name.split("Ward")[0].trim()}`
                        : "Select ward..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search by name or number..." />
                    <CommandList>
                        <CommandEmpty>No ward found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {wards.map((ward) => (
                                <CommandItem
                                    key={ward.id}
                                    value={`${ward.id} ${ward.name}`} // Include both ID and Name in value for search matching
                                    onSelect={() => {
                                        onChange(ward.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === ward.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span>{ward.id}. {ward.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
