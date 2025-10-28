import { useCallback, useMemo, useState } from 'react';

type Validator<T> = (values: T) => Record<string, string>;

export function useFormValidation<T extends Record<string, any>>(initialValues: T, validate: Validator<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validate({ ...values, [field]: value }));
    }
  }, [touched, validate, values]);

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  }, [validate, values]);

  const validateAll = useCallback(() => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    // mark all fields touched that appear in errors
    const allTouched: Record<string, boolean> = { ...touched };
    Object.keys(values).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);
    return Object.keys(nextErrors).length === 0;
  }, [validate, values, touched]);

  const resetForm = useCallback((nextValues?: T) => {
    setValues(nextValues ?? initialValues);
    setTouched({});
    setErrors({});
  }, [initialValues]);

  return {
    values,
    setValues,
    touched,
    errors,
    isValid,
    setFieldValue,
    markTouched,
    validateAll,
    resetForm,
  } as const;
}



