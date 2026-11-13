"use client"

type ConfirmDeleteButtonProps = {
  /** A Server Action, usually bound to the id of the record. */
  readonly action: () => Promise<void>
  readonly label: string
  readonly confirmText: string
}

export function ConfirmDeleteButton({
  action,
  label,
  confirmText,
}: ConfirmDeleteButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="btn btn-secondary"
        onClick={(event) => {
          if (!window.confirm(confirmText))
            event.preventDefault()
        }}
      >
        {label}
      </button>
    </form>
  )
}
