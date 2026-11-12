# Coding Guidelines

Go Hall of Fame follows a strict set of coding guidelines to keep maintainability high. They are
largely inspired by [Clean Code Notes](https://github.com/JuanCrg90/Clean-Code-Notes) and the
Clean Code book, and carried over from the CrossLang project.

## Who enforces these guidelines?

Claude, on every change it writes or reviews, and the author when self-reviewing. A change that
violates the guidelines is reworked before it is considered done.

## The Guidelines

_Reviews can refer to these as **CG{n}**, where {n} is the number of the rule._

1. Always apply the Boy Scout rule
   The Boy Scout Rule says **"always leave the campground cleaner than you found it"**.
   If we update functionality which was not tested, we write the tests ourselves.
   If we find a way to refactor old code while creating a new feature, we refactor it.
   This is not a task you do every 'x' amount of time, it is something you do in each and every
   change to the codebase. Do not scope-creep into unrelated files.
2. Use meaningful names
   + 2.1 Follow set conventions
     Follow the existing naming convention for "typical" files (use cases, `*Impl` repositories,
     entities, models, loaders). These files and the types inside them must follow the same
     conventions.
   + 2.2 Use intention-revealing names
     Use names that reveal the intention of variables, classes, or functions.
   + 2.3 Avoid disinformation
     ALWAYS **avoid leaving false clues that obscure the meaning of code**. Avoid words whose
     entrenched meanings differ from the intended meaning.
   + 2.4 Use pronounceable names
     Use names you can say out loud, so that variables, functions and classes are easy to refer
     to in natural language.
   + 2.5 Class and type names are nouns
   + 2.6 Function names are verbs
3. Keep functions as simple and as small as possible
   + 3.1 Make functions SMALL.
   + 3.2 Ensure that the nesting depth of a function is not greater than 2 (if it is, refactor).
   + 3.3 Follow the Single Responsibility Principle (SRP). Functions do exactly one thing.
   + 3.4 Use descriptive names. Don't be afraid to **make a name long**. A long descriptive name
     is better than a short enigmatic name or a long descriptive comment.
   + 3.5 Keep the number of arguments low
     The ideal number of arguments is zero. Next comes one, followed closely by two. Three should
     be avoided. More than three requires very special justification. Group related values into a
     params object. This keeps unit tests of a function simple.
   + 3.6 Command Query Separation
     **Functions should either do something or answer something, but not both.** Either change the
     state of an object, or return information about it.
4. **Test all functionality you write**
   + 4.1 Any new or changed **domain logic** (entities with behavior, use cases), core helper or
     **data-layer logic** (repository implementations, data sources, models'
     `fromRawData`/`toEntity`) MUST ship with a test in the same commit that adds the
     functionality. Not as a follow-up, and not only when asked.
   + 4.2 Tests-after-the-fact are acceptable; no tests is not. Writing the failing test first
     (the 3 laws of TDD) is encouraged, especially for business rules such as nomination
     validation.
   + 4.3 Presentation code (screens, components, styling and layout) is exempt. Loaders and form
     handlers in `presentation/state` are tested when they contain non-trivial logic (branching,
     parsing), not when they only forward a use case call.
   + 4.4 Fake repository interfaces with `vi.fn()` or small hand-written fakes in use-case tests.
     Pure entity logic needs no mocking.
   + 4.5 Create or adapt integration tests when a user journey changes.
5. Keep classes small
   + 5.1 Make classes small.
   + 5.2 Ensure classes have one responsibility.
   + 5.3 Keep the number of instance variables low. Each method of a class should manipulate one
     or more of those variables.
6. Use interfaces to isolate from change
   + 6.1 Use interfaces
     Needs will change, therefore code will change. A client that depends on concrete details is
     at risk when those details change. Introduce interfaces at layer boundaries (repository
     interfaces first of all) to isolate the impact of those details.
7. TypeScript conventions
   + 7.1 `strict` mode always on. No `any`; use `unknown` and narrow it. No non-null assertions
     (`!`) or `as` casts to silence the compiler outside of tests. (`as const` on a literal is not
     a cast.)
   + 7.2 Prefer `readonly` data and immutable updates for entities and state.
   + 7.3 Model states with discriminated unions rather than several booleans.
   + 7.4 Named exports. File names are `kebab-case`. Next.js requires default exports for `page`,
     `layout`, `error` and `not-found` files: those route files only re-export or render.
