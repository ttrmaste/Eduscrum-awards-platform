# Eduscrum-awards-platform
# 🏆 EduScrum Awards Platform


An interactive platform developed to recognize, reward, and motivate students and teams using the **eduScrum** methodology.

## 📖 About the Project

The **EduScrum Awards Platform** was created to value the effort, collaboration, and soft skills of students during their projects. Through this platform, teachers  and Scrum Masters can award distinctions, badges, and prizes to team members for their performance during the *Sprints*.

## ✨ Key Features

- **User and Team Management:** Profile creation and role management (Students, Scrum Masters, Teachers).
- **Awards and Badges Assignment:** Recognition of specific skills (e.g., "Best Collaboration", "Fastest Sprint").
- **Secure Authentication:** Login and route protection using JWT tokens.
- **Leaderboard / Dashboard:** Overview of team progress, scores, and rankings.

---

## 🛠️ Technologies Used

This project is built on a client-server architecture using the following technologies:

### Backend
- **Java 17**
- **Spring Boot** (REST API)
- **Spring Security + JWT** (Authentication and Authorization)
- **Spring Data JPA / Hibernate** (ORM and data persistence)
- **Maven** (Dependency management)
- **PostgreSQL** (Relational database)

### Frontend
- **React + TypeScript** (User Interface)
- **Vite** (Fast build tool)
- **React Router** (Application routing)
- **Axios** (API communication)
- **Tailwind CSS** (Fast and responsive styling)

---

## 🚀 How to Install and Run Locally

Since the project is divided into Frontend and Backend, you will need to run both environments.

### Prerequisites
- [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) installed
- [Maven](https://maven.apache.org/) installed
- [Node.js](https://nodejs.org/) (v16 or higher) installed
- [PostgreSQL](https://www.postgresql.org/) installed and running locally
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone [https://github.com/ttrmaste/Eduscrum-awards-platform.git](https://github.com/ttrmaste/Eduscrum-awards-platform.git)
cd Eduscrum-awards-platform
```
2. Configure and Run the Backend (Spring Boot)

    Open a terminal and navigate to the backend folder (adjust the folder name if necessary):
    Bash
```
cd backend
```
Create a database in PostgreSQL (e.g., eduscrum_db).

Configure the database credentials in the src/main/resources/application.properties or application.yml file:
Properties

spring.datasource.url=jdbc:postgresql://localhost:5432/eduscrum_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

Install the dependencies and run the server:
Bash

    mvn clean install
    mvn spring-boot:run

    The backend will be running at http://localhost:8080.

3. Configure and Run the Frontend (React + Vite)

    Open a new terminal and navigate to the frontend folder:
    Bash
```
cd frontend
```
Install the project dependencies:
Bash
```
npm install
```
(or yarn install if you are using Yarn)

Start the development server:
Bash
```
npm run dev
```
The frontend will be accessible in your browser, usually at http://localhost:5173.
