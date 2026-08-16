# AI-Augmented TDD Instructions
You must enforce strict Test-Driven Development (TDD) rules.
1. When asked to create a feature, write the xUnit unit tests inside the target `.Tests` project FIRST. Use FluentAssertions if needed.
2. Ensure tests explicitly outline behavior, constraints, and validation parameters.
3. DO NOT write production code implementations until instructed to make the failing tests pass.
4. Keep core architecture strictly bounded via Dependency Injection. Rely only on interfaces inside the `.Core` layer.