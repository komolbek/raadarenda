'use client';

import { useState, useEffect } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X, CalendarDays, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // Calculate rental days
  const rentalDays = value?.from && value?.to
    ? differenceInDays(value.to, value.from) + 1
    : 0;

  const handleSelect = (range: DateRange | undefined) => {
    // Update parent immediately; keep the picker open so the user can adjust
    // either endpoint and explicitly confirm with the Apply button.
    onChange(range);
  };

  const formatDisplayDate = () => {
    if (!value?.from) return t('date_picker.select_dates');
    if (!value.to) return format(value.from, 'd MMM yyyy', { locale: ru });
    return `${format(value.from, 'd MMM', { locale: ru })} - ${format(value.to, 'd MMM yyyy', { locale: ru })}`;
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

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
          'group flex w-full items-center gap-3 rounded-xl border-2 border-input bg-card px-4 py-3 text-left transition-all duration-200',
          'hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
          isOpen && 'border-primary ring-4 ring-primary/10'
        )}
      >
        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className={cn('block truncate', !value?.from && 'text-muted-foreground')}>
            {formatDisplayDate()}
          </span>
          {rentalDays > 0 && (
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {rentalDays} {rentalDays === 1 ? t('date_picker.day_one') : rentalDays < 5 ? t('date_picker.day_few') : t('date_picker.day_many')}
            </span>
          )}
        </div>
        {value?.from && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClearDates}
            className="h-6 w-6 rounded-lg bg-muted hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t('date_picker.select_period')}</h3>
                      {rentalDays > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t('date_picker.selected_days', { count: rentalDays })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Selected Range Display */}
                {value?.from && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-sm"
                  >
                    <div className="flex-1 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-0.5">{t('date_picker.start')}</p>
                      <p className="font-medium">{format(value.from, 'd MMMM yyyy', { locale: ru })}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-0.5">{t('date_picker.end')}</p>
                      <p className="font-medium">
                        {value.to ? format(value.to, 'd MMMM yyyy', { locale: ru }) : '—'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Calendar */}
              <div className="p-6">
                <DayPicker
                  mode="range"
                  selected={value}
                  onSelect={handleSelect}
                  locale={ru}
                  disabled={{ before: minDate, after: maxDate }}
                  numberOfMonths={2}
                  showOutsideDays
                  classNames={{
                    months: 'flex gap-6',
                    month: 'space-y-4',
                    month_caption: 'flex justify-center pt-1 relative items-center mb-4',
                    caption_label: 'text-sm font-semibold',
                    nav: 'absolute inset-x-0 top-0 flex items-center justify-between px-1',
                    button_previous:
                      'h-8 w-8 bg-transparent p-0 hover:bg-muted rounded-lg flex items-center justify-center transition-colors',
                    button_next:
                      'h-8 w-8 bg-transparent p-0 hover:bg-muted rounded-lg flex items-center justify-center transition-colors',
                    weekday: 'text-muted-foreground w-10 font-medium text-xs uppercase',
                    day: 'text-center text-sm p-0',
                    day_button: cn(
                      'h-10 w-10 p-0 font-medium rounded-lg transition-all duration-200',
                      'hover:bg-primary/10',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
                    ),
                    selected: 'bg-primary text-primary-foreground hover:bg-primary',
                    range_start: 'bg-primary text-primary-foreground rounded-l-lg',
                    range_end: 'bg-primary text-primary-foreground rounded-r-lg',
                    range_middle: 'bg-primary/20 text-foreground rounded-none',
                    today: 'font-bold text-primary',
                    outside: 'text-muted-foreground/30 opacity-30',
                    disabled: 'text-muted-foreground/20 opacity-30 cursor-not-allowed line-through',
                    hidden: 'invisible',
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
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                <button
                  onClick={handleClearDates}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('date_picker.clear')}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={!value?.from || !value?.to}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    value?.from && value?.to
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {t('date_picker.apply')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
