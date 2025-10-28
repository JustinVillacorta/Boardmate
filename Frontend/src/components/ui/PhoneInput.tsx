// PhoneInput.tsx
import React from 'react';
import Input from './Input';
import { formatPhoneNumber } from '../../utils/validation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  label = 'Phone Number',
  required = false,
  name = 'phone',
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <Input
      id={id || name}
      name={name}
      type="tel"
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      placeholder="+63 9XXXXXXXXX"
    />
  );
};

export default PhoneInput;