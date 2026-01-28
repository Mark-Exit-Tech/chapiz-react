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
}

const GetStartedDatePicker = ({
  label,
  id,
  value,
  required = false,
  maxDate,
  onChange,
  ...props
}: GetStartedDatePickerProps) => {
  const locale = useLocale() as string;
  const isRTL = locale === 'he';
  const parsedDate =
    value && !isNaN(Date.parse(value)) ? new Date(value) : new Date();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(parsedDate);
      newDate.setDate(date.getDate());
      onChange(newDate);
      setIsPopoverOpen(false);
    }
  };

  const handleMonthChange = (month: string) => {
    if (parsedDate) {
      const newDate = new Date(parsedDate);
      newDate.setMonth(parseInt(month, 10));
      onChange(newDate);
    }
  };

  const handleYearChange = (year: string) => {
    if (parsedDate) {
      const newDate = new Date(parsedDate);
      newDate.setFullYear(parseInt(year, 10));
      onChange(newDate);
    }
  };

  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor={id}
        className={cn(
          'absolute top-2.5 w-fit text-sm text-black transition-all duration-200 ease-in-out',
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
            {...props}
            className={cn(
              "h-10 w-full justify-start border-gray-300 bg-white px-3 text-base font-normal hover:bg-white",
              isRTL && "justify-end"
            )}
          >
            <span className={cn(isRTL && "text-right")}>{value ? format(parsedDate!, 'dd/MM/yyyy') : ''}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto p-0" align="start" dir={isRTL ? 'rtl' : 'ltr'}>
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={parsedDate || undefined}
            onSelect={handleDateChange}
            disabled={(date) => {
              if (maxDate) {
                return date > maxDate;
              }
              return false;
            }}
            month={
              parsedDate
                ? new Date(parsedDate.getFullYear(), parsedDate.getMonth())
                : undefined
            }
            components={{
              MonthCaption: ({ calendarMonth }) => (
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                  {/* Month Dropdown */}
                  <div className="w-1/2">
                    <Select
                      value={
                        parsedDate
                          ? parsedDate.getMonth().toString()
                          : calendarMonth.date.getMonth().toString()
                      }
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {format(
                            new Date(
                              0,
                              parsedDate
                                ? parsedDate.getMonth()
                                : calendarMonth.date.getMonth()
                            ),
                            'M'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }).map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {format(new Date(0, index), 'M')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Dropdown */}
                  <div className="w-1/2">
                    <Select
                      value={
                        parsedDate
                          ? parsedDate.getFullYear().toString()
                          : calendarMonth.date.getFullYear().toString()
                      }
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {parsedDate
                            ? parsedDate.getFullYear().toString()
                            : calendarMonth.date.getFullYear().toString()}
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
              )
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GetStartedDatePicker;
