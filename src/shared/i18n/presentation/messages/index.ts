import type { Locale } from "@/core/locales"

import { en, type Messages } from "./en"
import { es } from "./es"
import { pt } from "./pt"
import { fr } from "./fr"
import { de } from "./de"
import { it } from "./it"
import { nl } from "./nl"
import { sv } from "./sv"
import { pl } from "./pl"
import { ru } from "./ru"
import { tr } from "./tr"
import { ar } from "./ar"
import { hi } from "./hi"
import { id } from "./id"
import { vi } from "./vi"
import { zh } from "./zh"
import { ja } from "./ja"
import { ko } from "./ko"

export type { Messages }

export const MESSAGES: Readonly<Record<Locale, Messages>> =
  {
    en,
    es,
    pt,
    fr,
    de,
    it,
    nl,
    sv,
    pl,
    ru,
    tr,
    ar,
    hi,
    id,
    vi,
    zh,
    ja,
    ko,
  }
