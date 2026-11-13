"use client"

import { useState } from "react"

type LinkedSelectFieldsProps = {
  /** The form field name; every row posts one value under it. */
  readonly name: string
  readonly legend: string
  /** The accessible label of the "+" button. */
  readonly addLabel: string
  readonly options: readonly {
    readonly value: string
    readonly label: string
  }[]
  /** The values chosen so far (a blank row is added when there are none). */
  readonly initial: readonly string[]
  readonly hint?: string
  readonly error?: string
}

type KeyedRow = {
  readonly key: number
  readonly value: string
}

/** A fieldset of selects, one per linked item, with a "+" icon button to add another row. */
export function LinkedSelectFields({
  name,
  legend,
  addLabel,
  options,
  initial,
  hint,
  error,
}: LinkedSelectFieldsProps) {
  const [rows, setRows] = useState<readonly KeyedRow[]>(
    () => initial.map((value, key) => ({ key, value })),
  )
  const [nextKey, setNextKey] = useState(initial.length)

  function addRow() {
    setRows([...rows, { key: nextKey, value: "" }])
    setNextKey(nextKey + 1)
  }

  function changeRow(key: number, value: string) {
    setRows(
      rows.map((row) =>
        row.key === key ? { ...row, value } : row,
      ),
    )
  }

  function removeRow(key: number) {
    setRows(rows.filter((row) => row.key !== key))
  }

  return (
    <fieldset className="field m-0 border-0 p-0">
      <legend className="mb-1.5 flex w-full items-center justify-between p-0 text-xs opacity-70">
        <span>{legend}</span>
      </legend>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((row) => (
          <li key={row.key} className="flex gap-2">
            <select
              name={name}
              aria-label={legend}
              value={row.value}
              onChange={(event) =>
                changeRow(row.key, event.target.value)
              }
              className="input min-w-0 flex-1"
            >
              <option value="">Choose…</option>
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="btn btn-secondary px-2.5"
              aria-label={`Remove from ${legend}`}
              title="Remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-secondary px-2.5 text-lg leading-none"
          aria-label={addLabel}
          title={addLabel}
        >
          +
        </button>
      </div>
      {hint && (
        <div className="mt-1 text-xs opacity-70">
          {hint}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="text-accent-700 mt-1 text-xs font-bold"
        >
          {error}
        </div>
      )}
    </fieldset>
  )
}
