export default function Select({
  id,
  name,
  label,
  value,
  defaultValue,
  onChange,
  options = [],
  error = '',
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
      <select
        id={id}
        name={name || id}
        {...(value !== undefined ? { value } : {})}
        {...(defaultValue !== undefined && value === undefined ? { defaultValue } : {})}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 rounded-lg bg-slate-700 border text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
          error ? 'border-red-500' : 'border-slate-600'
        }`}
        {...props}
      >
        <option value="">-- Selecciona una opción --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
