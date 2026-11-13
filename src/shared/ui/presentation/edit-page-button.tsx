"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { adminEditTargetFor } from "./admin-edit-target"

export function EditPageButton() {
  const target = adminEditTargetFor(usePathname())
  if (target === null) return null

  return (
    <Link href={target.href} className="btn btn-secondary">
      {target.label}
    </Link>
  )
}
