import { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  error?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  minDate = new Date(),
  maxDate,
  label,
  error,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const formatDisplayDate = () => {
    if (!value?.from) return 'Выберите даты';
    if (!value.to) return format(value.from, 'd MMM', { locale: ru });
    return `${format(value.from, 'd MMM', { locale: ru })} - ${format(value.to, 'd MMM', { locale: ru })}`;
  };

  return (
    <div className={cn('relative w-full', className)}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border-2 border-input bg-card px-4 py-3 text-left transition-all duration-200',
          'hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
          isOpen && 'border-primary ring-4 ring-primary/10'
        )}
      >
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className={cn(!value?.from && 'text-muted-foreground')}>
          {formatDisplayDate()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 top-full z-50 mt-2 rounded-2xl bg-card border border-border p-4 shadow-2xl"
            >
              <DayPicker
                mode="range"
                selected={value}
                onSelect={handleSelect}
                locale={ru}
                disabled={{ before: minDate, after: maxDate }}
                numberOfMonths={2}
                showOutsideDays
                classNames={{
                  months: 'flex gap-4',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button:
                    'h-7 w-7 bg-transparent p-0 hover:bg-muted rounded-lg flex items-center justify-center',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: cn(
                    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                    'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                  ),
                  day: cn(
                    'h-9 w-9 p-0 font-normal',
                    'hover:bg-muted rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
                  ),
                  day_range_start: 'day-range-start',
                  day_range_end: 'day-range-end',
                  day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg',
                  day_today: 'bg-muted text-foreground',
                  day_outside: 'text-muted-foreground opacity-50',
                  day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
                  day_range_middle:
                    'aria-selected:bg-primary/10 aria-selected:text-foreground',
                  day_hidden: 'invisible',
                }}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === 'left' ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ),
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
