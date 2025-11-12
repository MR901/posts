---
layout: post
title: "(Project) Engineering Team: Four-Agent Software Development System"
date: 2025-11-21 00:00:00 +0530
categories: [ai, agents, projects, crewai]
tags: [agentic-ai, crewai, code-generation, software-engineering, multi-agent, delegation]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build a complete software engineering team using CrewAI with Product Manager, Software Engineer, Quality Assurance, and DevOps agents collaborating to generate production-ready applications."
image:
  path: /attachments/posts/2025-11-21-project-engineering-team-four-agent-system/images/preview_art.png
  alt: "Engineering Team Multi-Agent System"
allow_edit: true
---


Engineering Team: Four-Agent Software Development System
=========================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 3 Project | **Framework:** `CrewAI </posts/crewai-framework-multi-agent-teams>`_


Preface: Collaborative Software Development
--------------------------------------------

Software development requires diverse expertise: product management defines requirements, engineers implement code, QA validates quality, DevOps ensures deployability. Real teams achieve quality through collaboration—specialists contributing domain expertise toward shared deliverables.

Can AI agents model this collaboration effectively?

This project answers through four-agent engineering team: PM agent drafts specifications, Engineer implements code, QA writes tests, DevOps creates deployment configurations. CrewAI orchestrates collaboration through task dependencies and delegation patterns. The result: complete, production-ready applications generated from high-level prompts.

Beyond toy code generation, this demonstrates practical software development patterns—requirements to implementation, testing, deployment—through multi-agent orchestration. The architecture reveals when AI assists development (boilerplate, standard patterns, configuration) versus where humans remain essential (architecture decisions, complex algorithms, business logic).


.. code-block:: mermaid

   graph TB
       Prompt[User Prompt:<br/>Build TodoApp] --> PM[Product Manager Agent]
       PM --> PRD[Product Requirements<br/>Features, User Stories]
       PRD --> Engineer[Software Engineer Agent]
       Engineer --> Code[Implementation Code<br/>React + FastAPI]
       Code --> QA[Quality Assurance Agent]
       QA --> Tests[Test Suite<br/>Unit + Integration]
       Tests --> DevOps[DevOps Agent]
       DevOps --> Deploy[Deployment Config<br/>Docker, CI/CD]
       Deploy --> Output[Complete Application]

       PM -.delegation.-> Engineer
       Engineer -.delegation.-> QA
       QA -.delegation.-> DevOps


Project Overview
----------------

**What You'll Build:**

Engineering team that generates complete applications including:
- Product requirements document
- Frontend code (React/Vue)
- Backend API (FastAPI/Express)
- Test suite
- Docker configuration
- Deployment instructions

**Learning Objectives:**

- CrewAI delegation patterns (agents calling agents)
- Multi-agent workflows with task dependencies
- Code generation with context awareness
- File output management
- Gradio interface for user-facing deployment


Architecture
------------

Four specialized agents:

1. **Product Manager:** Requirements gathering, PRD creation
2. **Software Engineer:** Code implementation (frontend + backend)
3. **Quality Assurance:** Test suite generation
4. **DevOps:** Deployment configuration


Implementation Guide
--------------------

**Agent Configuration**

**agents.yaml:**

.. code-block:: yaml

   product_manager:
     role: "Senior Product Manager"
     goal: "Create comprehensive product requirements for {application}"
     backstory: >
       You're an experienced PM who writes clear, detailed requirements.
       You think about user needs, edge cases, and technical feasibility.
       You create actionable specs engineers can implement directly.
     llm: gpt-4o
     allow_delegation: true
     verbose: true

   software_engineer:
     role: "Full-Stack Software Engineer"
     goal: "Implement {application} based on product requirements"
     backstory: >
       You're a senior engineer with expertise in React, FastAPI, and modern
       web development. You write clean, well-structured code following best
       practices. You implement complete features, not partial solutions.
     llm: gpt-4o
     allow_delegation: true
     verbose: true

   qa_engineer:
     role: "Quality Assurance Engineer"
     goal: "Create comprehensive test suite for {application}"
     backstory: >
       You're a QA specialist who ensures code quality through thorough testing.
       You write unit tests, integration tests, and end-to-end tests using
       pytest and Jest. You think about edge cases and failure modes.
     llm: gpt-4o-mini
     verbose: true

   devops_engineer:
     role: "DevOps Engineer"
     goal: "Create deployment configuration for {application}"
     backstory: >
       You're a DevOps expert specializing in Docker, CI/CD, and cloud deployment.
       You create reproducible deployments with proper environment management.
       You think about security, scalability, and maintainability.
     llm: gpt-4o-mini
     verbose: true


**Task Configuration**

**tasks.yaml:**

.. code-block:: yaml

   create_prd:
     description: >
       Create product requirements document for {application}:
       - User stories and use cases
       - Feature list with priorities
       - Technical requirements
       - API endpoints needed
       - Data models
       - UI/UX considerations
     expected_output: >
       Detailed PRD in markdown format with all technical specifications
       needed for implementation.
     agent: product_manager
     output_file: "output/{application}/PRD.md"

   implement_application:
     description: >
       Implement {application} based on PRD:
       - Frontend (React with TypeScript)
       - Backend API (FastAPI)
       - Database models
       - API endpoints
       - Complete, runnable code
     expected_output: >
       Complete source code organized by frontend/ and backend/ directories.
       Include requirements.txt and package.json.
     agent: software_engineer
     context: [create_prd]
     output_file: "output/{application}/implementation.md"

   create_tests:
     description: >
       Create comprehensive test suite for {application}:
       - Backend unit tests (pytest)
       - Frontend component tests (Jest)
       - Integration tests
       - Test coverage report
     expected_output: >
       Complete test files for frontend and backend with setup instructions.
     agent: qa_engineer
     context: [implement_application]
     output_file: "output/{application}/tests.md"

   create_deployment:
     description: >
       Create deployment configuration for {application}:
       - Dockerfile for containerization
       - docker-compose.yml for local development
       - CI/CD pipeline (GitHub Actions)
       - Environment variable documentation
       - Deployment instructions
     expected_output: >
       Complete deployment configuration with step-by-step setup guide.
     agent: devops_engineer
     context: [implement_application, create_tests]
     output_file: "output/{application}/deployment.md"


**Crew Definition**

**crew.py:**

.. code-block:: python

   from crewai import Agent, Crew, Process, Task
   from crewai.project import CrewBase, agent, crew, task

   @CrewBase
   class EngineeringTeamCrew:
       """Software engineering team crew."""

       agents_config = "config/agents.yaml"
       tasks_config = "config/tasks.yaml"

       @agent
       def product_manager(self) -> Agent:
           return Agent(config=self.agents_config['product_manager'])

       @agent
       def software_engineer(self) -> Agent:
           return Agent(config=self.agents_config['software_engineer'])

       @agent
       def qa_engineer(self) -> Agent:
           return Agent(config=self.agents_config['qa_engineer'])

       @agent
       def devops_engineer(self) -> Agent:
           return Agent(config=self.agents_config['devops_engineer'])

       @task
       def create_prd(self) -> Task:
           return Task(
               config=self.tasks_config['create_prd'],
               agent=self.product_manager()
           )

       @task
       def implement_application(self) -> Task:
           return Task(
               config=self.tasks_config['implement_application'],
               agent=self.software_engineer()
           )

       @task
       def create_tests(self) -> Task:
           return Task(
               config=self.tasks_config['create_tests'],
               agent=self.qa_engineer()
           )

       @task
       def create_deployment(self) -> Task:
           return Task(
               config=self.tasks_config['create_deployment'],
               agent=self.devops_engineer()
           )

       @crew
       def crew(self) -> Crew:
           return Crew(
               agents=self.agents,
               tasks=self.tasks,
               process=Process.SEQUENTIAL,
               verbose=True
           )


**Gradio Interface**

**app.py:**

.. code-block:: python

   import gradio as gr
   from engineering_team.crew import EngineeringTeamCrew
   import os

   def build_application(app_description: str, app_name: str):
       """Build application using engineering team.

       Args:
           app_description: Natural language description
           app_name: Application name (slug format)

       Returns:
           Summary of generated artifacts
       """
       inputs = {
           'application': app_name,
           'description': app_description
       }

       crew = EngineeringTeamCrew()
       result = crew.crew().kickoff(inputs=inputs)

       # Collect generated files
       output_dir = f"output/{app_name}"
       files = []
       if os.path.exists(output_dir):
           files = os.listdir(output_dir)

       summary = f"""
## Application Built: {app_name}

### Generated Artifacts:
{chr(10).join([f'- {f}' for f in files])}

### Next Steps:
1. Review PRD in `{output_dir}/PRD.md`
2. Examine code in `{output_dir}/implementation.md`
3. Run tests from `{output_dir}/tests.md`
4. Deploy using `{output_dir}/deployment.md`

### Full Output:
{result.raw}
       """

       return summary

   # Gradio interface
   interface = gr.Interface(
       fn=build_application,
       inputs=[
           gr.Textbox(
               label="Application Description",
               placeholder="Build a todo list app with user authentication...",
               lines=5
           ),
           gr.Textbox(
               label="Application Name",
               placeholder="todo-app",
               value="my-app"
           )
       ],
       outputs=gr.Markdown(label="Build Summary"),
       title="🏗️ Engineering Team: AI Software Development",
       description="Describe your application and let the AI engineering team build it.",
       examples=[
           ["Build a todo list app with CRUD operations and SQLite database", "todo-app"],
           ["Create a blog platform with posts, comments, and markdown support", "blog-platform"],
           ["Build a weather dashboard fetching data from OpenWeather API", "weather-dashboard"]
       ]
   )

   if __name__ == "__main__":
       interface.launch()


**Run the Team:**

.. code-block:: bash

   # CLI execution
   crewai run

   # Gradio interface
   python app.py


Commercial Applications
-----------------------

**Rapid Prototyping:** Generate MVPs from concepts quickly

**Boilerplate Generation:** Standard app structures (CRUD, dashboards)

**Code Scaffolding:** Generate starter code for common patterns

**Developer Productivity:** Automate repetitive setup work

**Education:** Teaching software development workflows


Enhancements
------------

**Add Code Execution Tool:**

.. code-block:: python

   from crewai.tools import BaseTool
   import subprocess

   class CodeExecutionTool(BaseTool):
       name: str = "Execute Code"
       description: str = "Run Python code and return output"

       def _run(self, code: str) -> str:
           try:
               result = subprocess.run(
                   ["python", "-c", code],
                   capture_output=True,
                   text=True,
                   timeout=5
               )
               return result.stdout or result.stderr
           except Exception as e:
               return f"Execution error: {str(e)}"


**Add GitHub Integration:**

.. code-block:: python

   from github import Github

   def create_repository(app_name: str, code_files: dict):
       """Create GitHub repo with generated code."""
       g = Github(os.getenv("GITHUB_TOKEN"))
       user = g.get_user()
       repo = user.create_repo(app_name)

       for file_path, content in code_files.items():
           repo.create_file(
               path=file_path,
               message=f"Add {file_path}",
               content=content
           )

       return repo.html_url


**Lesson to Remember:**

Engineering Team demonstrates multi-agent collaboration through role specialization and task dependencies. Each agent contributes domain expertise; sequential execution ensures information flow; delegation enables agents consulting each other. This models real software teams effectively—not replacing humans but automating routine work (boilerplate, standard patterns, configuration).

The pattern generalizes: decompose complex workflows into specialist roles, define clear task dependencies, enable collaboration through context sharing. CrewAI's configuration-driven approach scales this systematically—add specialists by defining agents, add capabilities by creating tasks, coordinate through process configuration.

More broadly, the project reveals AI-assisted development's current frontier: excellent at structured patterns, standard implementations, configuration—limited in complex algorithms, novel architectures, domain-specific logic. The future likely combines AI handling routine work while humans focus on creative problem-solving.


**Resources:**

- GitHub: https://github.com/ed-donner/agents/tree/main/week-3-crew/engineering-team
- CrewAI Docs: https://docs.crewai.com
- Related: Stock Picker (Week 3), Agent Creator (Week 5)

---

*Generated code requires review before production deployment. Treat as starting point requiring human verification.*

