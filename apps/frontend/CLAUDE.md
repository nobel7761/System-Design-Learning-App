# Frontend conventions (MUST follow)

Two non-negotiable UI rules for this app. Full detail lives in the project
skills `shared-ui-components` and `thin-page-files` — invoke them when doing UI work.

## 1. All UI components come from `src/components/shared`

- Import UI building blocks only via `@/components/shared/...`.
- Never hand-roll an inline `<button>`/`<input>`/table/spinner/modal/etc. when a
  shared component exists, and never import UI from outside `shared`.
- If a needed component is missing, **create it inside `src/components/shared`
  first** (add to the folder's `index.ts` barrel if there is one), then use it.
- Existing: `CustomButton`, `Loader` (root, default exports);
  `@/components/shared/form` (RHFZodForm + all `Form*`/`Plain*` fields);
  `@/components/shared/table` (`DataTable`);
  `@/components/shared/shadcn` (56 shadcn/ui primitives, new-york style on
  Tailwind v4 — Button, Dialog, Card, Select, etc., via the folder barrel).

## 2. `page.tsx` (and route files) stay thin — only call components

- Route files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`) only
  compose and render components. No detailed JSX, business logic, state,
  data-fetching, or handlers inline — push all of it into components.
