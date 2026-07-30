# EduScrum Awards Platform

A gamified web platform that lets professors recognize and reward student teams working with the **eduScrum** methodology — tracking courses, subjects, projects, sprints, team performance, awards/badges, and leaderboards.

## Overview

EduScrum Awards is a full-stack, role-based application for managing eduScrum-based coursework. Professors organize courses into subjects and projects, students are grouped into teams that work through sprints, and the platform layers gamification on top: professors can create prizes/badges ("Prémios"), award them to students, and everyone can check rankings ("Rankings") at the student or team level.

Three roles are supported end-to-end: **Admin**, **Professor**, and **Aluno** (Student), each with a dedicated dashboard and permissions.

## Key Features

**Authentication & Users**
- Registration and login secured with JWT (stateless sessions)
- Role-based access (Admin / Professor / Aluno) via the `PapelSistema` enum
- Admin user management dashboard (list, create, delete users)
- Per-user profile page

**Courses & Subjects**
- Admins/Professors create and manage courses (`Curso`)
- Courses are broken down into subjects (`Disciplina`)
- Professors are linked to the courses they teach; students are linked to the courses they attend
- Course export endpoint for professors (`/api/professores/cursos/{cursoId}/exportar`)

**Projects, Teams & Sprints**
- Each subject can hold one or more projects (`Projeto`)
- Projects are divided into sprints (`Sprint`) to track iterative progress
- Students are organized into teams (`Equipa`) per project, with team member management (`MembroEquipa`)

**Gamification**
- Professors create prizes/badges (`Premio`) per subject
- Prizes are awarded to students, generating achievement records (`Conquista`)
- Students can view their own achievements

**Rankings**
- Global student leaderboard
- Per-course student leaderboard
- Per-project team leaderboard

## Tech Stack

**Backend**
- Java 17
- Spring Boot 3.5 (Web, Data JPA, Security, Validation)
- Spring Security + JWT (`jjwt`) for stateless authentication
- Hibernate / Spring Data JPA (ORM)
- PostgreSQL (relational database)
- Maven (build & dependency management)
- Lombok
- JUnit + Spring Boot Test + H2 (in-memory DB for integration tests)
- JaCoCo (test coverage reports)

**Frontend**
- React 19 + TypeScript
- Vite (build tool / dev server)
- React Router v7 (routing, incl. protected routes)
- Axios (HTTP client, with JWT bearer interceptor)
- Tailwind CSS (styling)
- Radix UI primitives + `class-variance-authority` (UI components)
- React Hook Form + Zod (forms & validation)
- Recharts (charts, e.g. rankings/stats)
- ESLint (linting)

## Project Structure

```
Eduscrum-awards-platform/
└── EduScrum-Awards-main/
    ├── backend/
    │   └── awards/awards/                  # Spring Boot project (Maven)
    │       ├── pom.xml
    │       └── src/
    │           ├── main/java/com/eduscrum/awards/
    │           │   ├── EduScrumAwardsApplication.java
    │           │   ├── config/             # SecurityConfig (CORS, JWT filter chain)
    │           │   ├── controller/         # REST controllers (one per resource)
    │           │   ├── model/              # JPA entities + DTOs
    │           │   ├── repository/         # Spring Data JPA repositories
    │           │   ├── security/           # JwtAuthFilter, JwtUtil
    │           │   └── service/            # Business logic layer
    │           ├── main/resources/
    │           │   └── application.properties
    │           └── test/java/com/eduscrum/awards/  # Integration tests (Auth, Curso, Disciplina, Equipa)
    │
    └── frontend/                           # React + Vite project
        ├── package.json
        ├── tailwind.config.js / vite.config.ts / tsconfig*.json
        └── src/
            ├── main.tsx                    # Router setup (all routes/pages)
            ├── App.tsx                     # Layout (Navbar/Footer) + Outlet
            ├── components/                 # Navbar, Footer, ProtectedRoute, ui/ (button, card, input, label, tabs)
            ├── context/AuthContext.tsx     # Auth state (login/logout, current user)
            ├── lib/api.ts                  # Axios instance with JWT interceptor
            ├── services/auth.ts
            └── pages/
                ├── Home.tsx, Sobre.tsx, Login.tsx, Register.tsx
                ├── Dashboard.tsx (Aluno) / ProfessorDashboard.tsx / AdminDashboard.tsx
                ├── Perfil.tsx, AdminGestaoUtilizadores.tsx
                ├── AlunoCursos.tsx / AlunoCursoDetalhes.tsx
                ├── ProfessorCursos.tsx / ProfessorCursoDetalhes.tsx
                ├── DisciplinaDetalhes.tsx
                ├── ProjetoEquipas.tsx / EquipaMembros.tsx / Sprints.tsx
                ├── Premios.tsx
                └── Rankings.tsx
```

## API Overview

All backend endpoints are prefixed with `/api` and return JSON.

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | `POST /login`, `POST /register` |
| Users | `/api/utilizadores` | `GET /me`, list, create, delete |
| Courses | `/api/cursos` | CRUD + `/{id}/professores`, `/{id}/alunos` |
| Student-Course | `/api/alunos/{alunoId}/cursos` | link/unlink a student to a course |
| Professor-Course | `/api/professores/{professorId}/cursos` | link/unlink a professor to a course, `/exportar` |
| Subjects | `/api/cursos/{cursoId}/disciplinas` | CRUD, plus create project under a subject |
| Subjects (public) | `/api/disciplinas/{id}` | read-only subject/project lookup |
| Projects | `/api/projetos`, `/api/disciplinas/{id}/projetos`, `/api/cursos/{id}/projetos` | CRUD |
| Teams | `/api/equipas` | CRUD, `/projeto/{idProjeto}`, member management |
| Sprints | `/api/projetos/{id}/sprints`, `/api/sprints/{id}` | CRUD |
| Gamification | `/api/disciplinas/{id}/premios`, `/api/premios/{id}/atribuir/{alunoId}`, `/api/alunos/{id}/conquistas` | prizes & achievements |
| Rankings | `/api/rankings/alunos/global`, `/api/rankings/alunos/curso/{id}`, `/api/rankings/equipas/projeto/{id}` | leaderboards |

## How to Run

### Prerequisites
- Java 17
- Maven
- Node.js 16+ and npm
- PostgreSQL, running locally
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ttrmaste/Eduscrum-awards-platform.git
cd Eduscrum-awards-platform/EduScrum-Awards-main
```

### 2. Backend (Spring Boot)

```bash
cd backend/awards/awards
```

Create a PostgreSQL database (e.g. `eduscrum_awards`), then edit `src/main/resources/application.properties` with your own credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/eduscrum_awards
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
```

> Security note: this file currently contains a real local password committed to the repo. Move credentials to environment variables (or a local, gitignored `application-local.properties`) before treating this as production-ready.

Run the backend:

```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend (React + Vite)

```bash
cd EduScrum-Awards-main/frontend
npm install
```

Create a `.env` file in `frontend/` pointing to the backend:

```
VITE_API_URL=http://localhost:8080
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Running tests (backend)

```bash
cd backend/awards/awards
mvn test
```

Integration tests cover authentication, courses, subjects, and teams (JaCoCo generates a coverage report under `target/site/jacoco`).

## Languages

- **Java** (backend, Spring Boot)
- **TypeScript** (frontend, React)
- **SQL** (PostgreSQL schema, via JPA/Hibernate)
- **HTML/CSS** (Tailwind CSS + component styles)
