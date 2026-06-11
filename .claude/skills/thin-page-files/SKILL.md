---
name: thin-page-files
description: >-
  ENFORCE whenever creating or editing a Next.js route file (page.tsx, and also
  layout.tsx / template.tsx / error.tsx / loading.tsx). These route files must
  stay THIN — they only compose and call components. No detailed UI markup,
  business logic, data-fetching, state, or handlers inline. Push all real
  implementation into components under src/components/shared (or a feature
  component) and just call them from the page.
---

# Thin page files (pages only call components)

`page.tsx` (and other Next.js route files) are **composition only**. They wire
components together — they do not contain the implementation.

## Hard rules

1. **A `page.tsx` should mostly be imports + a small component tree.** Render
   components and pass props. That's it.
2. **No detailed code in the page**, including:
   - No large blocks of JSX/markup → move into a component.
   - No business logic, data transforms, or computed UI → move into a component
     or hook.
   - No `useState` / `useEffect` / data-fetching / event handlers living in the
     page → move into the relevant component.
   - No inline styling logic or repeated markup → that belongs in a component.
3. **Where the real code goes:** reusable UI building blocks go in
   `src/components/shared` (see the `shared-ui-components` skill). Page-specific
   composition components can live in a feature folder, but they must still be
   built FROM shared components.
4. **Server vs client:** keep pages as server components when possible; put
   `"use client"` interactivity inside the called components, not the page.

## Good shape

```tsx
// app/users/page.tsx
import { UsersScreen } from "@/components/users/UsersScreen";

export default function UsersPage() {
  return <UsersScreen />;
}
```

All the state, fetching, table, and forms live inside `UsersScreen` and the
shared components it uses — never inline in `page.tsx`.

## Before finishing a page edit

- Does the page contain detailed JSX, logic, state, or handlers? → extract it
  into a component and call that component instead.
- Is every UI building block coming from a component (ideally shared)? If you
  introduced raw markup, move it out.
