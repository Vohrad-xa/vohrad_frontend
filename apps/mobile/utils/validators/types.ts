export type ValidationState = 'empty' | 'invalid' | 'valid';

export type ValidationResult<TValue = string> = {
  isValid: boolean;
  state: ValidationState;
  error: string | null;
  value?: TValue;
};
