import "server-only"

import { CriteriaDataSource } from "@/features/induction/data/data-sources/criteria-data-source"
import { NominationsDataSource } from "@/features/induction/data/data-sources/nominations-data-source"
import { CriteriaRepositoryImpl } from "@/features/induction/data/repositories/criteria-repository-impl"
import { NominationsRepositoryImpl } from "@/features/induction/data/repositories/nominations-repository-impl"
import { ListCriteria } from "@/features/induction/domain/use-cases/list-criteria"
import { SubmitNomination } from "@/features/induction/domain/use-cases/submit-nomination"
import { createInductionState } from "@/features/induction/presentation/state/induction-state"

import { database } from "./infrastructure"

export const inductionState = createInductionState({
  listCriteria: new ListCriteria(
    new CriteriaRepositoryImpl(
      new CriteriaDataSource(database),
    ),
  ),
  submitNomination: new SubmitNomination(
    new NominationsRepositoryImpl(
      new NominationsDataSource(database),
    ),
  ),
})
