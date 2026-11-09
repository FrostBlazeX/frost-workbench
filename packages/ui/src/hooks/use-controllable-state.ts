import { useCallback, useState } from "react";

export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<T>(defaultValue);

  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue];
}
