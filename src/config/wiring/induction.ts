import "server-only"

import { CriteriaDataSource } from "@/features/induction/data/data-sources/criteria-data-source"
import { NominationsDataSource } from "@/features/induction/data/data-sources/nominations-data-source"
import { CriteriaRepositoryImpl } from "@/features/induction/data/repositories/criteria-repository-impl"
import { NominationsRepositoryImpl } from "@/features/induction/data/repositories/nominations-repository-impl"
import { DeleteCriterion } from "@/features/induction/domain/use-cases/delete-criterion"
import { DeleteNomination } from "@/features/induction/domain/use-cases/delete-nomination"
import { GetCriterion } from "@/features/induction/domain/use-cases/get-criterion"
import { ListCriteria } from "@/features/induction/domain/use-cases/list-criteria"
import { ListNominations } from "@/features/induction/domain/use-cases/list-nominations"
import { PageCriteria } from "@/features/induction/domain/use-cases/page-criteria"
import { SaveCriterion } from "@/features/induction/domain/use-cases/save-criterion"
import { SetNominationStatus } from "@/features/induction/domain/use-cases/set-nomination-status"
import { SubmitNomination } from "@/features/induction/domain/use-cases/submit-nomination"
import { createInductionAdminState } from "@/features/induction/presentation/state/induction-admin-state"
import { createInductionState } from "@/features/induction/presentation/state/induction-state"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

const criteria = new CriteriaRepositoryImpl(
  new CriteriaDataSource(database),
)
const nominations = new NominationsRepositoryImpl(
  new NominationsDataSource(database),
)
const listCriteria = new ListCriteria(criteria)

export const inductionState = createInductionState({
  pageCriteria: new PageCriteria(criteria),
  submitNomination: new SubmitNomination(nominations),
})

export const inductionAdminState =
  createInductionAdminState({
    requireAdmin,
    listCriteria,
    getCriterion: new GetCriterion(criteria),
    saveCriterion: new SaveCriterion(criteria),
    deleteCriterion: new DeleteCriterion(criteria),
    listNominations: new ListNominations(nominations),
    setNominationStatus: new SetNominationStatus(
      nominations,
    ),
    deleteNomination: new DeleteNomination(nominations),
  })
