# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-08-25

### Performance Improvements
- **otel**: Optimized `getTraceContext` by caching the require of `@opentelemetry/api` so it is not executed on every request.
- **logger**: Avoided unnecessary object allocation when logging without fields.

## [1.0.1] - 2026-08-25

### Chore
- Prepared package for initial npm publish.
- Configured OpenTelemetry tracing and middleware support.
- Added `README.md` and basic project setup.
