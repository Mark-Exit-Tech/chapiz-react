'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useLocale } from '@/hooks/use-locale';

interface GetStartedDatePickerProps {
  label: string;
  id: string;
  value?: string; // ISO string for selected date
  required?: boolean;
  maxDate?: Date; // Maximum selectable date
  onChange: (date: Date | null) => void;
  /** Calendar emoji or prefix from translation (e.g. "📅 ") */
  calendarPrefix?: string;
}

const GetStartedDatePicker = ({
  label,
  id,
  value,
  required = false,
  maxDate,
  onChange,
  calendarPrefix = '📅 ',
  ...props
}: GetStartedDatePickerProps) => {
  const locale = useLocale() as string;
  const isRTL = locale === 'he';
  const parsedDate =
    value && !isNaN(Date.parse(value)) ? new Date(value) : new Date();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(parsedDate);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setIsPopoverOpen(false);
    }
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(parseInt(month, 10));
    setDisplayMonth(newDate);
    if (value) {
      const updatedValue = new Date(parsedDate);
      updatedValue.setMonth(parseInt(month, 10));
      onChange(updatedValue);
    }
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year, 10));
    setDisplayMonth(newDate);
    if (value) {
      const updatedValue = new Date(parsedDate);
      updatedValue.setFullYear(parseInt(year, 10));
      onChange(updatedValue);
    }
  };

  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor={id}
        className={cn(
          'absolute top-2.5 w-fit text-sm text-black transition-all duration-200 ease-in-out pointer-events-none',
          isRTL ? 'right-3 left-auto' : 'left-3',
          value
            ? 'text-black -top-6 text-sm font-medium'
            : 'top-2.5 text-black'
        )}
      >
        {label}
        {required ? '*' : ''}
      </label>

      {/* Date Picker */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            dir={isRTL ? 'rtl' : 'ltr'}
            className={cn(
              "h-10 w-full border-gray-300 bg-white px-3 text-base font-normal hover:bg-white justify-start",
              isRTL ? "text-right" : "text-left"
            )}
          >
            <span className={cn("block min-w-0 py-1.5 pe-5 text-inherit", isRTL ? "text-right" : "text-left")}>
              {calendarPrefix}{value ? format(parsedDate!, 'dd/MM/yyyy') : ''}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col p-0 z-50" align="start" sideOffset={4}>
          {/* Custom Month/Year Dropdowns */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
            {/* Month Dropdown */}
            <div className="w-1/2">
              <Select
                value={displayMonth.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue>
                    {format(new Date(0, displayMonth.getMonth()), 'MMMM')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {format(new Date(0, index), 'MMMM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Dropdown */}
            <div className="w-1/2">
              <Select
                value={displayMonth.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue>
                    {displayMonth.getFullYear().toString()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: new Date().getFullYear() - 2000 + 1 },
                    (_, i) => (2000 + i).toString()
                  ).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calendar Grid */}
          <Calendar
            mode="single"
            selected={parsedDate || undefined}
            onSelect={handleDateChange}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            disabled={(date) => {
              if (maxDate) {
                return date > maxDate;
              }
              return false;
            }}
            disableNavigation
            classNames={{
              month_caption: 'hidden',
              nav: 'hidden',
              day_button: 'h-9 w-9 p-0 font-normal cursor-pointer hover:bg-accent rounded-md flex items-center justify-center'
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GetStartedDatePicker;
