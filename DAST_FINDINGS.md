# VulnTrack DAST Findings

| Field | Value |
|---|---|
| Target application | VulnTrack v0.0.1-SNAPSHOT |
| Test date | September 29, 2026 |
| Tester | Ronan Kongala |
| Methodology | OWASP Top 10 manual testing using Burp Suite |
| Scope | Lab environment only. No external systems were targeted. |

## Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Missing Content-Security-Policy Header | Low | Open |
| 2 | Authentication Enforced on All Protected Endpoints | Informational | No action required |
| 3 | SQL Injection Test on Filter Parameters | Informational | No vulnerability found |

---

## Finding 1: Missing Content-Security-Policy Header

- **Severity:** Low
- **Tool:** Burp Suite Community Edition v2026.8
- **Target:** `http://172.24.220.60:8081/api/vulnerabilities`
- **Status:** Open

**Description**

The API responses do not include a `Content-Security-Policy` header. While the backend is a REST API serving JSON (not HTML), adding CSP to all responses is a defense-in-depth measure that prevents potential misuse if the API is ever consumed in an unexpected browser context.

**Evidence**

`GET /api/vulnerabilities` returned HTTP 401 with 13 response headers.

Present security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cache-Control: no-cache, no-store`
- `WWW-Authenticate: Bearer`

Absent:

- `Content-Security-Policy`

**Remediation**

Add a `Content-Security-Policy` header via Spring Security's `headers()` configuration. For a pure API backend:

```java
http.headers(headers -> headers
        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'")));
```

---

## Finding 2: Authentication Enforced on All Protected Endpoints (Positive Finding)

- **Severity:** Informational
- **Status:** No action required

**Description**

All API endpoints under `/api/vulnerabilities` require a valid JWT Bearer token. Unauthenticated requests return HTTP 401 with a structured JSON error and a `WWW-Authenticate: Bearer` challenge header. No endpoint was found to be publicly accessible without a valid token.

**Evidence**

`GET /api/vulnerabilities` with no `Authorization` header returned HTTP 401 `"Authentication required"`.

---

## Finding 3: SQL Injection Test on Filter Parameters (No Vulnerability Found)

- **Severity:** Informational
- **Status:** No vulnerability found

**Description**

Tested the filter query parameters (`?severity=' OR 1=1--&status=OPEN`) for SQL injection. The Spring Data JPA layer uses parameterized queries, so the input was treated as a literal enum value, returned an empty result set, and no SQL error or unexpected data was exposed.

**Evidence**

`GET /api/vulnerabilities?severity=%27+OR+1%3D1--&status=OPEN` returned HTTP 200 with an empty array `[]`.
