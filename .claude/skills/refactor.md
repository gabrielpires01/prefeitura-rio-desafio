---
name: refactor-clean
description: Refactors and New code following TDD, SOLID, and Clean Code principles for Go (Clean Architecture) and React/Next.js (Componentization). Use when the user asks to refactor, structure, or improve code quality.
---

When the user asks to refactor code or improve its design, you must strictly follow these instructions to deliver a high-quality, production-ready result.

## 1. Core Principles (Strictly Enforced)
- **TDD (Test-Driven Development):** Always present the test design before the implementation. Follow the Red-Green-Refactor cycle.
- **SOLID:** Enforce Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
- **Clean Code:** Use highly descriptive naming, avoid deep nesting by using early returns, and write self-documenting code instead of relying on comments.

## 2. Backend Architecture Guidelines (Go)
When refactoring or adding new Go code, enforce a pragmatical Clean Architecture / Hexagonal Architecture:
- **Layering:** Clearly separate concerns into Handlers/Controllers (HTTP transport), Services (Business Logic), and Repositories (Data Access/Persistence).
- **Dependency Injection:** Use constructors to inject dependencies (e.g., `NewUserService(repo UserRepository)`). Always rely on **Interfaces** rather than concrete implementations to decouple infrastructure from domain logic.
- **Error Handling:** Return errors explicitly (`return nil, err`). Use `errors.Is` and `errors.As`. Wrap infrastructure errors logically before passing them up to the handler layer.
- **Testing:** Design **Table-Driven Tests** (`[]struct{ name, input, expected }`) using the standard `testing` package. Mock interface dependencies to test the Service layer in complete isolation.

## 3. Frontend Architecture Guidelines (React / Next.js)
When refactoring or adding React code, enforce strict Componentization and logic separation:
- **Separation of Concerns:** Extract complex state management, data fetching, and business logic into **Custom Hooks** (e.g., `useChildrenData.ts`). The `.tsx` components must act purely as a presentation layer.
- **Componentization:** Break down large components into smaller, single-responsibility pieces. Use component composition (`children` props) to prevent prop-drilling.
- **Immutability & Purity:** Keep components as pure functions whenever possible. Avoid unnecessary side-effects and strictly minimize `useEffect` usage.
- **Testing:** Use Jest and React Testing Library to test user behavior (e.g., simulating user clicks, verifying accessible roles) rather than testing internal component states.

## 4. Execution Workflow
You must format your response strictly using the following 4 steps:
1. **Critical Analysis:** Briefly list the SOLID or Clean Code violations in the user's original code.
2. **Test Design (TDD):** Output the test structure *before* the refactored code (Go Table-Driven Test or React Testing Library behavior test).
3. **Refactored Code:** Output the fully refactored, decoupled code separating layers and components.
4. **Architectural Summary:** Briefly explain in bullet points why the new design is superior (e.g., "Extracting the repository interface allows for instant mocking during unit tests").
