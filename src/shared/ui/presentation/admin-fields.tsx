import type { ReactNode } from "react"

type FieldBase = {
  readonly name: string
  readonly label: string
  readonly error?: string
  readonly hint?: string
}

function describedBy({
  name,
  error,
  hint,
}: Pick<FieldBase, "name" | "error" | "hint">) {
  const ids = [
    error ? `field-${name}-error` : null,
    hint ? `field-${name}-hint` : null,
  ].filter(Boolean)
  return ids.length > 0 ? ids.join(" ") : undefined
}

function FieldNotes({
  name,
  error,
  hint,
}: Pick<FieldBase, "name" | "error" | "hint">) {
  return (
    <>
      {hint && (
        <div
          id={`field-${name}-hint`}
          className="mt-1 text-xs opacity-70"
        >
          {hint}
        </div>
      )}
      {error && (
        <div
          id={`field-${name}-error`}
          role="alert"
          className="text-accent-700 mt-1 text-xs font-bold"
        >
          {error}
        </div>
      )}
    </>
  )
}

type TextFieldProps = FieldBase & {
  readonly defaultValue?: string
  readonly type?: "text" | "number" | "url"
  readonly maxLength?: number
  readonly placeholder?: string
  readonly required?: boolean
}

export function TextField(props: TextFieldProps) {
  const {
    name,
    label,
    defaultValue,
    type = "text",
    maxLength,
    placeholder,
    required,
    error,
  } = props
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>{label}</label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        className="input"
        defaultValue={defaultValue}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(props)}
      />
      <FieldNotes {...props} />
    </div>
  )
}

type TextAreaFieldProps = FieldBase & {
  readonly defaultValue?: string
  readonly rows?: number
  readonly maxLength?: number
}

export function TextAreaField(props: TextAreaFieldProps) {
  const {
    name,
    label,
    defaultValue,
    rows = 4,
    maxLength,
    error,
  } = props
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>{label}</label>
      <textarea
        id={`field-${name}`}
        name={name}
        className="input"
        rows={rows}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(props)}
      />
      <FieldNotes {...props} />
    </div>
  )
}

type SelectFieldProps = FieldBase & {
  readonly defaultValue?: string
  readonly options: readonly {
    readonly value: string
    readonly label: string
  }[]
}

export function SelectField(props: SelectFieldProps) {
  const { name, label, defaultValue, options, error } =
    props
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>{label}</label>
      <select
        id={`field-${name}`}
        name={name}
        className="input"
        defaultValue={defaultValue}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(props)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldNotes {...props} />
    </div>
  )
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
}: Omit<FieldBase, "error"> & {
  readonly defaultChecked?: boolean
}) {
  return (
    <div className="field">
      <label className="!mb-0 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
        />
        {label}
      </label>
      {hint && (
        <div className="mt-1 text-xs opacity-70">
          {hint}
        </div>
      )}
    </div>
  )
}

type CheckboxGroupProps = Omit<FieldBase, "error"> & {
  readonly options: readonly {
    readonly value: string
    readonly label: string
  }[]
  readonly defaultValues: readonly string[]
}

export function CheckboxGroup({
  name,
  label,
  options,
  defaultValues,
  hint,
}: CheckboxGroupProps) {
  return (
    <fieldset className="field m-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-xs opacity-70">
        {label}
      </legend>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={defaultValues.includes(
                option.value,
              )}
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint && (
        <div className="mt-1 text-xs opacity-70">
          {hint}
        </div>
      )}
    </fieldset>
  )
}

export function FormMessage({
  message,
}: {
  readonly message: string
}) {
  return (
    <p
      role="alert"
      className="text-accent-700 text-sm font-bold"
    >
      {message}
    </p>
  )
}

type FormActionsProps = {
  readonly isPending: boolean
  readonly submitLabel: string
  readonly cancelHref: string
  readonly children?: ReactNode
}

export function FormActions({
  isPending,
  submitLabel,
  cancelHref,
  children,
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isPending}
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
      <a href={cancelHref} className="btn btn-secondary">
        Cancel
      </a>
      {children}
    </div>
  )
}
