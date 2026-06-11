# Portable Form Service (Copy-Paste Ready)

You can copy this whole `form` folder into another React project and use it directly.

## Required Dependencies

Install these in the target project:

- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `@headlessui/react`
- `framer-motion`

## Styling Requirement

These components use Tailwind utility classes.  
If your target project does not use Tailwind, you will need to replace classes with your own CSS.

## Import Usage

Use components from `index.ts`:

```ts
import { RHFZodForm, FormInput, FormSelect, FormSubmitButton } from "./form";
```

## Notes For Other Projects

- No Next.js import is used inside this folder.
- All internal imports are relative, so no path alias setup is required.
- File validation that checks `File` in schema should use browser-safe checks if server rendering is enabled.
- This folder is UI-focused and framework-agnostic for React apps.
