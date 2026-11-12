import { succeed, type DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import {
  summarizeHome,
  type HomeSummary,
} from "../entities/home-summary"
import type { HomeRepository } from "../repositories/home-repository"

export class GetHomeSummary implements UseCase<
  NoParams,
  DataState<HomeSummary>
> {
  constructor(private readonly home: HomeRepository) {}

  async call() {
    const facts = await this.home.getFacts()
    if (facts.status === "failure") return facts
    return succeed(summarizeHome(facts.data))
  }
}
