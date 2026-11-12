export interface UseCase<Params, Result> {
  call(params: Params): Promise<Result>
}

export type NoParams = Readonly<Record<string, never>>
