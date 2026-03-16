# AGENTS.md - Douglas Barbearia Backend

## Project Overview

This is a TypeScript/Express REST API for a barbershop management system with Clean Architecture patterns.

## Stack

- **Language**: TypeScript
- **HTTP**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Auth**: JWT + Cookies + bcrypt
- **Testing**: Jest
- **Documentation**: Swagger

## Build / Lint / Test Commands

```bash
# Development (hot reload)
npm run dev

# Build TypeScript to dist/
npm run build

# Start production server
npm start

# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run single test file
npm test -- CreateUser.spec.ts

# Run single test (alternative syntax)
npm test -- --testPathPattern=CreateUser

# Run tests with coverage
npm test -- --coverage
npm run test:coverage

# Database seed
npm run db:seed
```

## Project Structure

```
src/
├── config/              # env.ts, auth.ts
├── core/                # Domain layer
│   ├── dtos/           # Data Transfer Objects
│   ├── entities/       # Domain entities
│   ├── errors/         # Custom error classes
│   ├── repositories/   # Repository interfaces
│   └── use-cases/      # Business logic
├── infra/              # Infrastructure layer
│   ├── database/       # Prisma repositories
│   └── http/           # Controllers, Routes, Schemas
└── index.ts            # Entry point
```

## Code Style Guidelines

### Naming Conventions

- **Classes**: PascalCase (e.g., `CreateUser`, `UserRepository`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IUserRepository`)
- **Files**: camelCase (e.g., `createUser.ts`, `userRepository.ts`)
- **Test files**: `.spec.ts` suffix (e.g., `CreateUser.spec.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `USER_ROLES`)
- **Enums/Types**: PascalCase (e.g., `UserType = "BARBER" | "CLIENT"`)

### Imports

- Use absolute imports from root (e.g., `import { User } from "@core/entities/User"`) or relative paths
- Order imports: external libraries → internal modules → local files
- Group: imports → interfaces/types → constants → classes

### TypeScript

- Always use explicit types for function parameters and return types
- Use `interface` for DTOs and repository contracts
- Use `type` for unions, aliases, and enums
- Enable strict null checks
- Use `readonly` for immutable properties in entities

### Entities

```typescript
export type UserType = "BARBER" | "CLIENT";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string | null,
    public type: UserType,
    public telephone: string,
    public provider?: string,
    public providerId?: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
```

### DTOs

```typescript
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: "CLIENT" | "BARBER";
  telephone: string;
}
```

### Error Handling

- Extend `AppError` for custom errors
- Include appropriate HTTP status codes (400, 401, 403, 404, 409, 500)
- Always use `Object.setPrototypeOf(this, new.target.prototype)` in Error subclasses

```typescript
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 409);
  }
}
```

### Use Cases

- Single responsibility: one use case per file
- Accept dependencies via constructor (dependency injection)
- Return domain entities or DTOs
- Always be `async`
- Throw domain-specific errors

```typescript
export class CreateUser {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByEmail(data.email);
    if (userAlreadyExists) {
      throw new UserAlreadyExistsError(data.email);
    }
    // ... implementation
    return user;
  }
}
```

### Controllers

- One controller per resource
- Constructor injection of use cases
- Return appropriate HTTP status codes (201 for create, 200 for ok)
- Never expose raw database entities directly - map to response DTOs

```typescript
export class RegisterUserController {
  constructor(private createUser: CreateUser) {}

  async handle(req: Request, res: Response) {
    const user = await this.createUser.execute(req.body);
    return res.status(201).send({ name: user.name, email: user.email });
  }
}
```

### Zod Schemas

- Use Zod for request validation
- Define schemas in `src/infra/http/schemas/input/`
- Include descriptive error messages in Portuguese
- Use `.trim()` for string validation

```typescript
export const CreateUserSchema = z.object({
  name: z.string().trim().min(3, "Nome precisa ter no mínimo 3 caracteres"),
  email: z.email("Email inválido").trim(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  telephone: z.string().trim().min(11, "Telefone invalido"),
});
```

### Repository Pattern

- Define interface in `src/core/repositories/`
- Implement in `src/infra/database/repositories/`
- Use Prisma for database operations

### Tests

- Unit tests for use cases
- Use fake repositories for testing
- Group tests with `describe()`
- Use meaningful test descriptions
- Follow AAA pattern: Arrange, Act, Assert

```typescript
describe("CreateUser", () => {
  it("should create a user", async () => {
    // Arrange
    const fakeRepo = new FakeUserRepository();
    const createUser = new CreateUser(fakeRepo);
    // Act
    const user = await createUser.execute(validData);
    // Assert
    expect(user.email).toBe(validData.email);
  });
});
```

### Routes

- Use Express Router
- Apply validation middleware
- Use RESTful naming conventions
- Register routes in `index.ts`

### General Guidelines

- No comments unless explaining complex business logic
- Use ESLint-compatible formatting
- Keep functions under 50 lines
- Prefer early returns
- Use async/await consistently
- Handle errors with domain-specific exceptions
- Never expose sensitive data (passwords, tokens) in responses
