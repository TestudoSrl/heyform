# Issue 276 and 277 fixes

## Summary

This change fixes two server-side regressions:

- Issue #276: CSV export requests now use the HTTP request query/body/params when `PermissionGuard` runs on REST controllers, preventing `args.input` from being read from an undefined GraphQL argument object.
- Issue #277: Nested question groups can now be accepted by the GraphQL form schema because child fields may carry the same recursive `properties.fields` shape as top-level fields.

## Implementation notes

- `PermissionGuard` detects HTTP execution contexts and builds its permission input from `requestParser`, so `/api/export/submissions?formId=...` can resolve form, project, and team permissions correctly.
- `FormChildFieldInput` now overrides `properties` with `PropertyInput`, allowing nested group children to pass GraphQL variable validation before the existing recursive draft sanitizer runs.
- Regression tests cover HTTP form guard query parsing and nested group draft sanitation.

## Verification

The following commands were run:

```bash
pnpm --filter ./packages/server exec ts-node -r tsconfig-paths/register test/permission.guard.test.ts
pnpm --filter ./packages/server exec ts-node -r tsconfig-paths/register test/form-schema.test.ts
pnpm --filter ./packages/server run type-check
pnpm --filter ./packages/server run build
```

A temporary Nest GraphQL schema generation check was also run against `UpdateFormSchemasResolver` to verify the recursive input type can be built at runtime.
