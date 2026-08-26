export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  defaultValue,
  onChange,
  placeholder = '',
  error = '',
  maxLength,
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
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className={`w-full px-3 py-2 rounded-lg bg-slate-700 border text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
          error ? 'border-red-500' : 'border-slate-600'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
