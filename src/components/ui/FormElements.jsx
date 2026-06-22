import clsx from 'clsx'

export const Input = ({ label, id, error, className, ...props }) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="label">{label}</label>}
    <input
      id={id}
      className={clsx('input', error && 'border-danger focus:ring-danger', className)}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
)

export const Textarea = ({ label, id, error, rows = 3, className, ...props }) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="label">{label}</label>}
    <textarea
      id={id}
      rows={rows}
      className={clsx('input resize-none', error && 'border-danger focus:ring-danger', className)}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
)

export const Select = ({ label, id, error, children, className, ...props }) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="label">{label}</label>}
    <select
      id={id}
      className={clsx('select', error && 'border-danger focus:ring-danger', className)}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
)

export default Input
