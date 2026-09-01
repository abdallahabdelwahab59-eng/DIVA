# DIVA Unified Threat / Failure Matrix v1.0

Status: IN REVIEW
Scope: Core Contracts
Rule: No Implementation Admission before Threat / Failure Review and Test Matrix approval.

---

## 1. TenantContext Contract

### Contract

TenantContext identifies the execution ownership scope:

- organizationId
- workspaceId
- projectId

### Security Invariant

Every operation using TenantContext must remain within the authorized:

Organization → Workspace → Project

boundary.

A TenantContext must never be treated as trusted merely because it exists structurally.

### Threats

1. Missing organization identity.
2. Missing workspace identity.
3. Missing project identity.
4. Mismatched organization/workspace/project relationship.
5. Cross-tenant project access.
6. Tenant context substitution.
7. Tenant context spoofing.
8. Tenant context leakage into another execution.
9. Reuse of stale TenantContext.
10. AI-generated or external input attempting to modify TenantContext.

### Failure Modes

1. Invalid tenant context reaches execution.
2. Project belongs to a different workspace.
3. Workspace belongs to a different organization.
4. Resource lookup uses projectId without validating ownership.
5. Background job executes with stale tenant context.
6. AI operation receives incorrect tenant context.
7. Tenant context is logged or exposed where it should not be.
8. Tenant context is accepted from untrusted client input without server-side validation.

### Impact

Severity: CRITICAL

Potential impact:

- Cross-tenant data access.
- Unauthorized project access.
- Data leakage.
- Unauthorized AI operations.
- Incorrect billing attribution.
- Incorrect audit attribution.
- Security boundary violation.

### Required Boundary

TenantContext must be treated as an authorization context, not merely as metadata.

The authoritative authorization decision must be performed by the backend.

Every protected resource access must validate:

Organization ownership
→ Workspace ownership
→ Project ownership
→ Resource authorization

Client-provided identifiers must never be sufficient by themselves.

### Required Controls

- Server-side TenantContext validation.
- Ownership validation.
- Authorization before protected access.
- No cross-tenant fallback.
- No implicit tenant switching.
- Explicit context propagation.
- Context isolation for background jobs.
- Context isolation for AI operations.
- Auditability of sensitive context usage.
- Deny-by-default behavior when context is missing or inconsistent.

### Unknown / Invalid Context Rule

If TenantContext is:

- missing,
- incomplete,
- inconsistent,
- unverifiable,
- or unauthorized,

the operation must be BLOCKED.

There is no automatic fallback to another tenant.

### AI Boundary

AI must never be allowed to:

- choose another tenant,
- modify tenant identity,
- override organizationId,
- override workspaceId,
- override projectId,
- request access to another project.

Tenant identity comes from an authorized execution context, not from AI-generated content.

### Failure Containment

A TenantContext failure must fail closed.

It must not:

- fall back to global context,
- use another project,
- use another tenant,
- continue with partial authorization,
- silently execute without tenant identity.

### Required Tests

1. Valid TenantContext is accepted.
2. Missing organizationId is rejected.
3. Missing workspaceId is rejected.
4. Missing projectId is rejected.
5. Mismatched hierarchy is rejected.
6. Cross-tenant access is rejected.
7. Unauthorized project access is rejected.
8. Invalid context cannot reach protected execution.
9. AI cannot modify tenant identity.
10. Background execution cannot inherit an unauthorized tenant context.

### Review Decision

Status: OPEN

Implementation Admission: BLOCKED until the required controls and tests are formally approved.

---
