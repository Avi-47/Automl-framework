import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  className?: string;
};

export function AnimatedCounter({ value, suffix = '', className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDisplayValue(value), 100);
    return () => window.clearTimeout(timeout);
  }, [value]);

  return <span className={cn(className)}>{displayValue.toLocaleString()} {suffix}</span>;
}