# VulnTrack

VulnTrack is a vulnerability management app for recording and triaging security findings against assets. A Spring Boot REST API and a React single-page app sit on PostgreSQL. Around the app I built the delivery side: a Jenkins pipeline with a SonarQube SAST quality gate, a Helm chart for Kubernetes, and a round of manual dynamic application security testing (DAST) with Burp Suite.

## Features

- Create, view, update and delete findings linked to assets
- Dashboard color-coded by severity, filterable by severity and status
- A SonarQube SAST gate in Jenkins that blocks the build on critical issues
- Kubernetes deployment through Helm

## Architecture

### Application

A Spring Boot 4 (Java 21) REST API exposes vulnerability and asset resources under `/api`, with Spring Data JPA for persistence and Flyway migrations for the PostgreSQL schema. Spring Security handles authentication with stateless JWTs. The React and TypeScript frontend (built with Vite) provides a login page, a color-coded dashboard with severity and status filters, and a detail view for each finding.

### CI/CD Pipeline

A declarative `Jenkinsfile` runs Checkout, Build Backend, Build Frontend, Test, SonarQube Analysis, Quality Gate, and Package stages. SonarQube runs locally through `sonar-compose.yml`, and the Quality Gate stage fails the build when new blocker or critical issues are introduced.

### Container Orchestration

The backend and frontend each have a Dockerfile. The frontend image serves the built SPA with nginx and proxies `/api` to the backend service. The Helm chart in `helm/vulntrack` deploys the backend, frontend, and PostgreSQL as separate Deployments with Services, a PersistentVolumeClaim for database storage, a ConfigMap for non-secret settings, and Secrets for credentials and the JWT signing key.

### Dynamic Security Testing

I tested the running app by hand with Burp Suite Community Edition, working from the OWASP Top 10. The tests covered security headers, authentication on protected endpoints and SQL injection through the filter parameters. One low-severity finding (a missing Content-Security-Policy header) came out of it and has been fixed. The write-up is in [DAST_FINDINGS.md](DAST_FINDINGS.md).

## Tools and Frameworks

The Status column marks which tools I had used on earlier projects (Reused) and which I picked up for this one (New).

| Area | Tools | Status |
|---|---|---|
| Backend | Java 21, Spring Boot, Spring Data JPA, Spring Security | Reused |
| Frontend | React, TypeScript, Vite | Reused |
| Database | PostgreSQL 16, Flyway | Reused |
| CI/CD | Jenkins | New |
| SAST | SonarQube | New |
| Container orchestration | Kubernetes, Helm | New |
| DAST | Burp Suite Community Edition | New |
| Containerization | Docker, Docker Compose | Reused |

## Results

- Every CRUD endpoint was exercised with curl.
- Requests without a valid JWT get HTTP 401 on all protected endpoints.
- The SonarQube gate failed the build on a BLOCKER `java:S6437` (hard-coded credentials) and a CRITICAL `java:S5547` (weak DES cipher). Once both were removed, the gate passed.
- Jenkins now runs with all stages green.
- All three pods on Kubernetes are running with 0 restarts.

## Repository Structure

```
vulntrack/
├── backend/                          Spring Boot REST API (Maven)
│   ├── Dockerfile
│   └── src/main/resources/
│       └── db/migration/             Flyway SQL migrations
├── frontend/                         React + TypeScript SPA (Vite)
│   ├── Dockerfile
│   └── nginx.conf.template
├── helm/
│   └── vulntrack/                    Helm chart for Kubernetes
├── docs/
│   └── screenshots/                  Screenshots referenced below
├── Jenkinsfile                       CI/CD pipeline definition
├── sonar-compose.yml                 Local SonarQube server
├── docker-compose.yml                Local PostgreSQL for development
└── DAST_FINDINGS.md                  Burp Suite DAST results
```

## Screenshots

![PostgreSQL schema created](docs/screenshots/postgres_schema_created.png)

*Flyway migration applied, creating the VulnTrack tables in PostgreSQL.*

![Spring Boot API verified](docs/screenshots/spring_boot_api_verified.png)

*CRUD endpoints of the REST API exercised with curl.*

![React dashboard view](docs/screenshots/react_dashboard_view.png)

*Dashboard with severity color-coding and severity and status filters.*

![Authentication enforced](docs/screenshots/auth_enforced.png)

*Unauthenticated requests rejected with HTTP 401; requests succeed only with a valid JWT.*

![Jenkins pipeline success](docs/screenshots/jenkins_pipeline_success.png)

*Jenkins pipeline with every stage passing.*

![SonarQube gate result](docs/screenshots/sonarqube_gate_result.png)

*SonarQube quality gate result for the backend analysis.*

![Helm deployment running](docs/screenshots/helm_deployment_running.png)

*Backend, frontend, and PostgreSQL pods running on Kubernetes with 0 restarts.*

![Burp Suite findings](docs/screenshots/burp_suite_findings.png)

*Burp Suite manual testing of the API; details in DAST_FINDINGS.md.*

## Authorization

This project was built and tested in a local lab environment. No external systems were targeted or accessed during testing.
