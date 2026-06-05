import { useState } from 'react';
import type { ZodSchema } from 'zod';

export function useFormField(schema?: ZodSchema) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  function validate(val: string): string {
    if (!schema) return '';
    const result = schema.safeParse(val);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return '';
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    if (touched) setError(validate(val));
  }

  function onBlur() {
    setTouched(true);
    setError(validate(value));
  }

  function validateNow(): boolean {
    setTouched(true);
    const err = validate(value);
    setError(err);
    return !err;
  }

  function reset() {
    setValue('');
    setError('');
    setTouched(false);
  }

  return { value, error, setError, onChange, onBlur, validateNow, reset };
}