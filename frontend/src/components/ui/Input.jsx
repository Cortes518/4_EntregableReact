export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  helperText = '',
  maxLength,
  showCounter = true,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        type={type}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined && value === undefined ? { defaultValue } : {})}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className={`w-full px-3 py-2 rounded-lg bg-slate-700 border text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
          error ? 'border-red-500' : 'border-slate-600'
        }`}
        {...props}
      />
      <div className="flex justify-between items-center text-xs min-h-[18px]">
        {error ? (
          <p className="text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-slate-400">{helperText}</p>
        ) : (
          <span />
        )}
        {showCounter && maxLength && value !== undefined && (
          <span className={`text-[11px] font-mono ml-2 ${value.length >= maxLength ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

