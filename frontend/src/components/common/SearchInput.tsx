import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/constants';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search companies...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  const hasValue = localValue.length > 0;

  return (
    <div className={cn('relative group', animations.colors, className)}>
      <div
        className={cn(
          'relative flex items-center',
          animations.transform,
          isFocused && 'transform scale-[1.02]'
        )}
      >
        {/* Search Icon */}
        <Search
          className={cn(
            'absolute left-2.5 sm:left-3 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-200',
            isFocused ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        {/* Input */}
        <Input
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'pl-9 sm:pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base',
            'border-border/50 focus:border-primary/50',
            'transition-all duration-200 ease-out',
            'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
            hasValue && 'pr-12'
          )}
        />

        {/* Clear Button */}
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              'absolute right-1 h-7 w-7 sm:h-8 sm:w-8 p-0',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'hover:bg-muted/80'
            )}
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        )}
      </div>

      {/* Search hint */}
      {isFocused && !hasValue && (
        <div
          className={cn(
            'absolute top-full mt-2 left-0 right-0',
            'text-xs text-muted-foreground',
            'animate-in fade-in-0 slide-in-from-top-1 duration-200'
          )}
        >
          Type to search across all companies in this list
        </div>
      )}
    </div>
  );
}
