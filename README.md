# Todo List App

## Introduction

Welcome to the Todo List Application! 
- This project is a fully functional, highly scalable, and production-ready to-do list application.
- It provides a RESTful API to handle CRUD (Create, Read, Update, Delete) operations for tasks and APIs for User Sign up, Login and Logout.
- Implements robust server-side validation and also provides functionality for user authentication and authorization.
- Includes deployment scripts, environment specific Helm charts and a Dockerfile, for automating deployment process.
- Contains various middlewares that automatically & efficiently handle authentication, authorization and request-response activity management for each HTTP request.
- Has its own utilities that handle Context Management, Error handling, Logging, Caching and HTTP requests effortlessly.
- Provides real-time application monitoring enabled via New Relic.
- Contains a comprehensive Swagger API Documentation for developers.

## Key Features

- **RESTful API (Create, Read, Update, Delete):**  Robust API built with Node.js and Express for reliable task management(APIs for user signup, user login, user logout, add task, update task, delete task, fetch tasks(includes task filtering and sorting as well) and an API to fetch supported filters).
- **Aerospike Caching:**  Intelligent caching with Aerospike enhances application performance for quick access to frequently used tasks.
- **Application Monitoring:**  Inbuilt application monitorimg using New Relic, providing access to all real-time metrics of the application and to numerous other features on the New Relic Dashboard.
- **Dependency Injection:**  Modular and maintainable code architecture for easy customization and future enhancements.
- **Validation & Error Handling:**  Ensures data integrity and provides clear feedback to users.
- **Pagination:**  Efficiently handles large datasets for optimal browsing and navigation.
- **Thoroughly Tested:**  Comprehensive unit tests for critical components guarantee reliability.
- **Security-Conscious:**  Includes basic security measures to protect your data.
- **User Authentication & Authorization:**  Secure your tasks with login/signup functionality and control who can view/edit them(Uses JWT whitelisting for authentication, role based authorization, etc).
- **Due Dates & Reminders:**  Customizable due dates and timely reminders.
- **Task Sorting & Searching:**  Effortlessly organize and find tasks with intuitive sorting and search capabilities.

## Technical Stack

- **Front-End:**  React.JS
- **Back-End:** Node.js, Express, and MySQL.
- **Caching:** Aerospike
- **Languages:** JavaScript, TypeScript
- **Data Storage:**  MySQL.
- **Testing:**  Sinon, Mocha.
- **Version Control:**  Git.
- **Deployment:** Docker, Helm, Kubernetes

## Getting Started

1. **Clone the Repository:** `git clone https://github.com/25ankurpandey/todo-app.git`
2. **Install Dependencies:** `npm install`
3. **Set Up config:** Setup config for service bootstrap, using a mock server(can be setup in multiple ways but will require slight code change to start working). Refer to Constants/service_config.json for sample config. Refer to Constants/user_auth.json for authorization config which is required for user authorization.
3. **Set Up Database:** Configure your database credentials in a different server or in a configuration file.
4. **Run the App:**  `npm start`
5. **Set Up Environment Variables:**  Create a .env file and add the necessary environment variables as per the .env.example.
6. **Deploy:** Use the provided deployment scripts (`deploy.sh`) and Helm charts with some tweaking according to requirements for streamlined deployment setup.

## API Endpoints
- You can interact with the API using tools like Postman or cURL. The base URL for the API is http://localhost:3000/todo-svc/v1
- For detailed API documentation, refer to the API Documentation in the repo's apidoc.json(https://github.com/25ankurpandey/todo-app/blob/main/apidoc.json). Use http://editor.swagger.io to render the apidoc.json

## Monitoring(New Relic)
- Create a new New Relic Key(https://newrelic.com/).
- Follow the instructions on the website to install and enable New Relic on your server machine for real-time application metrics.
