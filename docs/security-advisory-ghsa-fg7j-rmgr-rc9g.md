# GHSA-fg7j-rmgr-rc9g CORS Mitigation

## Summary

GHSA-fg7j-rmgr-rc9g reported that the server enabled credentialed CORS with
origin reflection. The vulnerable configuration was:

```ts
app.enableCors({
  origin: true,
  credentials: true
})
```

With this configuration, the server reflected any request `Origin` while also
setting `Access-Control-Allow-Credentials: true`.

## Fix

The server now uses an explicit allowlist for credentialed CORS. The allowlist
defaults to `APP_HOMEPAGE_URL` and can be overridden with
`CORS_ALLOWED_ORIGINS` when a deployment intentionally serves the dashboard and
API from different origins.

Example:

```env
APP_HOMEPAGE_URL=https://forms.example.com
CORS_ALLOWED_ORIGINS=https://forms.example.com,https://admin.example.com
```

Only exact normalized origins are allowed. Paths are ignored during
normalization, so `https://forms.example.com/dashboard` is treated as
`https://forms.example.com`.

## Operational Notes

- Do not use `*` or origin reflection with `credentials: true`.
- Keep `CORS_ALLOWED_ORIGINS` limited to trusted dashboard origins.
- Local webapp development uses the Vite proxy for `/graphql`, so wildcard CORS
  is not required for local development.
- The session cookie remains `HttpOnly` and `SameSite=Lax`; the CORS fix removes
  the server-side origin reflection that made credentialed response reads
  possible whenever cookies are sent.
