---
layout: post
title: "(Agentic AI Framework) CrewAI: Configuration-Driven Multi-Agent Teams"
date: 2025-11-13 00:00:00 +0530
categories: [ai, agents, crewai]
tags: [agentic-ai, crewai, yaml-configuration, multi-agent-systems, hierarchical-processing, agent-teams]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Master CrewAI's low-code approach to building multi-agent systems through YAML configuration, role-based agents, task assignment, and hierarchical processing for collaborative AI teams."
image:
  path: /attachments/posts/2025-11-13-crewai-framework-multi-agent-teams/images/preview_art.png
  alt: "CrewAI Framework Overview"
allow_edit: true
---


CrewAI: Configuration-Driven Multi-Agent Teams
===============================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 3 | **Previous:** `OpenAI Agents SDK </posts/openai-agents-sdk-framework>`_


Preface: The Appeal of Configuration
-------------------------------------

Software engineering presents a perennial tension: explicit code versus declarative configuration. Code offers maximum flexibility and control—every decision visible, every behavior explicit. Configuration promises rapid development—patterns recognized and abstracted, boilerplate eliminated, intent expressed succinctly.

CrewAI plants its flag firmly in configuration territory.

Where OpenAI Agents SDK provided primitives requiring assembly, CrewAI offers pre-built patterns accessible through YAML files. Agents become role descriptions in configuration rather than class instantiations in code. Tasks separate from agents as distinct entities, assigned through declarations. Multi-agent coordination—the orchestration that demands careful design in code-first frameworks—reduces to selecting "sequential" or "hierarchical" processing modes.

This approach carries profound implications for team dynamics and development velocity. Engineers preferring declarative approaches discover they can express complex multi-agent systems in dozens of YAML lines rather than hundreds of Python ones. Teams with mixed technical backgrounds find YAML configurations more accessible than Python agent instantiation. Product managers and domain experts can read, understand, and even modify agent definitions without deep programming expertise.

Yet configuration-driven frameworks embed opinions. The ease of getting started traces directly to opinionated defaults—sensible patterns that work excellently for common cases but potentially constrain unusual requirements. The framework guides toward specific architectures through the patterns it makes simple versus difficult.

CrewAI balances this tension thoughtfully. YAML handles standard patterns cleanly. Python tools and custom code handle exceptions. The division proves pragmatic: use configuration for the 80% of patterns that fit established molds, drop to code for the remaining 20% requiring custom logic.

This document explores CrewAI systematically—from foundational concepts through practical multi-agent implementations, from sequential workflows to hierarchical orchestration, from built-in tools to custom integrations. The journey reveals how configuration-driven frameworks accelerate development when problem structures align with framework patterns.


.. code-block:: mermaid

   mindmap
     root((CrewAI))
       Core Concepts
         Agents
         Tasks
         Crews
         Processes
       Agent Attributes
         Role
         Goal
         Backstory
         Tools
         Memory
       Task Attributes
         Description
         Expected Output
         Agent Assignment
         Output File
       Processing Modes
         Sequential
         Hierarchical
       Built-in Features
         Memory Systems
         Tool Integration
         LLM Flexibility
         Structured Outputs


Framework Philosophy: Low-Code Multi-Agent Systems
---------------------------------------------------

CrewAI's design emerges from recognizing patterns in multi-agent systems construction.


The Configuration-First Approach
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Traditional frameworks require defining agents programmatically:

.. code-block:: python

   # Code-first approach
   research_agent = Agent(
       name="researcher",
       instructions="You research topics thoroughly...",
       model="gpt-4o",
       tools=[search_tool, analyze_tool]
   )

CrewAI inverts this—agents live in `agents.yaml`:

.. code-block:: yaml

   # Configuration-first approach
   researcher:
     role: "Senior Financial Researcher"
     goal: "Uncover groundbreaking insights about {company}"
     backstory: >
       You're a seasoned financial researcher with a talent for finding
       the most relevant information about companies. Known for your ability
       to present complex findings in a clear, concise manner.
     llm: gpt-4o
     tools:
       - search_tool
       - analyze_tool

The distinction extends beyond syntax. Configuration-first design encourages thinking in terms of roles, goals, and teamwork rather than classes, methods, and execution flows.


Why Task-Based Architecture
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CrewAI introduces "tasks" as first-class entities—assignments to be completed, separate from the agents completing them. This separation mirrors real-world team dynamics:

**Real Team:** Manager assigns tasks to team members based on skills

**CrewAI:** Developer assigns tasks to agents based on roles

.. code-block:: yaml

   # tasks.yaml
   research_task:
     description: "Research {company} financial performance"
     expected_output: "Comprehensive analysis with key metrics"
     agent: researcher
     output_file: "research_results.md"

Tasks carry metadata: descriptions, expected outputs, assigned agents, output destinations. This structure enables hierarchical processing where manager LLMs dynamically assign tasks based on agent capabilities.


Sequential vs. Hierarchical Processing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Two orchestration modes dominate multi-agent systems:

**Sequential Processing:**

Tasks execute in defined order. Task 1 completes, Task 2 begins, Task 3 follows. Simple, predictable, suitable when workflow order is clear.

.. code-block:: mermaid

   graph LR
       A[Task 1: Research] --> B[Task 2: Analyze]
       B --> C[Task 3: Report]
       C --> D[Output]

**Hierarchical Processing:**

A manager LLM coordinates, dynamically assigning tasks to agents based on current state and agent capabilities. Complex, adaptive, suitable when optimal workflow depends on intermediate results.

.. code-block:: mermaid

   graph TD
       Manager[Manager LLM] --> T1[Task 1]
       Manager --> T2[Task 2]
       Manager --> T3[Task 3]
       T1 --> A1[Agent 1]
       T2 --> A2[Agent 2]
       T3 --> A1
       A1 --> Manager
       A2 --> Manager
       Manager --> Output[Final Output]

CrewAI makes mode selection a single line in configuration:

.. code-block:: python

   crew = Crew(
       agents=[researcher, analyst, writer],
       tasks=[research, analyze, write],
       process=Process.SEQUENTIAL  # or Process.HIERARCHICAL
   )


When CrewAI Excels
~~~~~~~~~~~~~~~~~~~

**Optimal Scenarios:**

- **Role-Based Teams:** Problems naturally decompose into specialist roles (researcher, analyst, writer)
- **Clear Task Sequences:** Workflows follow predictable patterns
- **Rapid Prototyping:** Need multi-agent systems operational in hours
- **Team Collaboration:** Mixed technical backgrounds benefit from readable YAML
- **Standard Patterns:** Requirements fit established multi-agent architectures

**Consider Alternatives When:**

- **Maximum Flexibility Needed:** OpenAI Agents SDK's code-first approach better
- **Complex State Management:** LangGraph's graph structures more appropriate
- **Custom Orchestration Logic:** Framework opinions become constraints

**Lesson to Remember:** CrewAI trades code-level flexibility for configuration-driven velocity. The framework's opinions—role-based agents, task-centric workflows, declarative specification—accelerate development when problem structures align with these patterns. Misalignment creates friction; perfect alignment creates velocity.


Core Concepts: Agents, Tasks, and Crews
----------------------------------------

Three primitives comprise CrewAI's architecture, each serving distinct purposes.


Agents: Autonomous Team Members
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Agents represent individuals in a crew, each with specific expertise and responsibilities.

**Agent Attributes:**

.. code-block:: yaml

   # config/agents.yaml
   financial_analyst:
     role: "Senior Financial Analyst"
     goal: "Provide comprehensive financial analysis of {company}"
     backstory: >
       You're a veteran Wall Street analyst with 15 years of experience.
       Your analyses have guided billions in investment decisions.
       You excel at distilling complex financial data into actionable insights.
     llm: gpt-4o
     tools:
       - financial_data_tool
       - sec_filings_tool
     max_iter: 15
     max_rpm: 60
     verbose: true
     allow_delegation: false

**Key Properties:**

- **role**: Agent's function within the team (shows in communication)
- **goal**: What the agent aims to achieve (parameterized with `{variables}`)
- **backstory**: Context shaping agent's perspective and approach
- **llm**: Language model powering the agent
- **tools**: Capabilities available to agent
- **max_iter**: Maximum iterations for task completion (prevents infinite loops)
- **max_rpm**: Rate limit (requests per minute) for API calls
- **verbose**: Whether to log detailed execution steps
- **allow_delegation**: Whether agent can delegate subtasks to other agents


The Role of Backstory
^^^^^^^^^^^^^^^^^^^^^^

Backstories prove more than flavor text—they fundamentally shape agent behavior through prompt engineering. A financial analyst with "15 years Wall Street experience" generates different outputs than one with "recent graduate passionate about fintech startups."

**Example: Different Backstories, Different Outputs**

.. code-block:: yaml

   conservative_analyst:
     role: "Risk-Averse Financial Analyst"
     backstory: >
       You survived the 2008 financial crisis by maintaining conservative positions.
       You prioritize capital preservation over aggressive growth.

   aggressive_analyst:
     role: "Growth-Focused Financial Analyst"
     backstory: >
       You made your reputation identifying high-growth opportunities early.
       You believe fortune favors the bold in emerging markets.

Same task, different agents—dramatically different analyses.


Tasks: Assignments with Expected Outputs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Tasks define work to be completed, independent of who completes them.

**Task Structure:**

.. code-block:: yaml

   # config/tasks.yaml
   financial_analysis:
     description: >
       Analyze {company}'s most recent financial statements.
       Focus on revenue trends, profit margins, and cash flow.
       Identify key risks and opportunities.
     expected_output: >
       A structured financial analysis report including:
       - Revenue analysis with year-over-year trends
       - Profitability metrics (gross margin, operating margin, net margin)
       - Cash flow assessment
       - Risk factors
       - Investment recommendation (Buy/Hold/Sell)
     agent: financial_analyst
     output_file: "output/financial_analysis.md"
     context:
       - market_research
       - competitor_analysis

**Key Attributes:**

- **description**: What needs to be accomplished (can reference crew input variables)
- **expected_output**: Specific deliverables and format requirements
- **agent**: Which agent receives assignment
- **output_file**: Where to write results (optional, supports markdown/JSON)
- **context**: Other tasks whose outputs this task should receive


Context and Task Dependencies
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The `context` field creates task dependencies. When task B lists task A in context, task B receives task A's output as additional information.

.. code-block:: yaml

   market_research:
     description: "Research {company}'s market position"
     agent: researcher

   competitive_analysis:
     description: "Analyze {company}'s competitive advantages"
     agent: analyst
     context: [market_research]  # Receives market_research output

   investment_recommendation:
     description: "Provide investment recommendation for {company}"
     agent: advisor
     context: [market_research, competitive_analysis]  # Receives both

Tasks execute respecting dependencies, ensuring downstream tasks receive upstream outputs.


Crews: Coordinated Teams
~~~~~~~~~~~~~~~~~~~~~~~~~

Crews combine agents and tasks into executable units.

**Crew Definition (Python):**

.. code-block:: python

   from crewai import Crew, Agent, Task, Process
   from crewai_tools import SerperDevTool

   @crew
   class FinancialResearchCrew:
       """Financial research crew."""

       @agent
       def researcher(self) -> Agent:
           """Load researcher from config."""
           return Agent(
               config=self.agents_config['researcher']
           )

       @agent
       def analyst(self) -> Agent:
           """Load analyst from config."""
           return Agent(
               config=self.agents_config['analyst'],
               tools=[SerperDevTool()]
           )

       @task
       def research_task(self) -> Task:
           """Load research task from config."""
           return Task(
               config=self.tasks_config['research'],
               agent=self.researcher()
           )

       @task
       def analysis_task(self) -> Task:
           """Load analysis task from config."""
           return Task(
               config=self.tasks_config['analysis'],
               agent=self.analyst()
           )

       @crew
       def crew(self) -> Crew:
           """Create crew."""
           return Crew(
               agents=self.agents,  # Automatically collects @agent methods
               tasks=self.tasks,    # Automatically collects @task methods
               process=Process.SEQUENTIAL,
               verbose=True
           )

The `@crew`, `@agent`, and `@task` decorators enable automatic discovery and initialization from YAML configurations.


Executing Crews
^^^^^^^^^^^^^^^

.. code-block:: python

   from financial_research.crew import FinancialResearchCrew

   def run():
       """Execute crew with inputs."""
       inputs = {
           'company': 'Tesla'
       }

       crew = FinancialResearchCrew()
       result = crew.kickoff(inputs=inputs)

       return result

   if __name__ == "__main__":
       result = run()
       print(result)

The `kickoff()` method initiates crew execution, interpolating inputs into agent goals and task descriptions wherever `{variable}` appears.

**Lesson to Remember:** CrewAI's three-tier architecture—Agents (who), Tasks (what), Crews (orchestration)—separates concerns cleanly. Agents defined by role and capabilities. Tasks defined by assignments and outputs. Crews coordinate agents executing tasks. This separation enables configuration-driven development: modify team composition without changing task definitions, or alter workflows without redefining agent capabilities.


Installation and Project Setup
-------------------------------

CrewAI projects follow standardized structure, initialized via CLI.


Prerequisites
~~~~~~~~~~~~~

- Python 3.10+ (3.12 recommended)
- UV package manager (recommended) or pip
- API keys: OpenAI, Anthropic, Google, or other LLM providers


CrewAI Project Initialization
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Install CrewAI CLI
   pip install crewai crewai-tools

   # Create new crew project
   crewai create crew my_crew_project

   # Navigate into project
   cd my_crew_project

This generates structured project:

.. code-block:: text

   my_crew_project/
   ├── src/
   │   └── my_crew_project/
   │       ├── config/
   │       │   ├── agents.yaml
   │       │   └── tasks.yaml
   │       ├── tools/
   │       │   └── custom_tool.py
   │       ├── __init__.py
   │       ├── crew.py
   │       └── main.py
   ├── tests/
   ├── .env
   ├── .gitignore
   ├── pyproject.toml
   └── README.md


API Configuration
~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # .env file
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SERPER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # For web search tool


With UV (Recommended)
~~~~~~~~~~~~~~~~~~~~~

CrewAI projects work seamlessly with UV:

.. code-block:: bash

   # UV automatically detects pyproject.toml
   cd my_crew_project
   uv sync

   # Run crew
   uv run crewai run


Basic "Hello World" Example
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Modify generated files for simple demonstration:

**config/agents.yaml:**

.. code-block:: yaml

   greeter:
     role: "Friendly Greeter"
     goal: "Greet {name} warmly and professionally"
     backstory: "You're an enthusiastic greeter who makes everyone feel welcome."
     llm: gpt-4o-mini

   poet:
     role: "Greeting Poet"
     goal: "Transform greetings into short poems"
     backstory: "You're a poet who turns simple greetings into memorable verses."
     llm: gpt-4o-mini

**config/tasks.yaml:**

.. code-block:: yaml

   greet:
     description: "Greet {name} warmly"
     expected_output: "A warm, professional greeting"
     agent: greeter

   poeticize:
     description: "Transform the greeting into a short poem"
     expected_output: "A 4-line poem based on the greeting"
     agent: poet
     context: [greet]

**src/my_crew_project/main.py:**

.. code-block:: python

   from my_crew_project.crew import MyCrewProjectCrew

   def run():
       inputs = {'name': 'Alice'}
       MyCrewProjectCrew().crew().kickoff(inputs=inputs)

   if __name__ == "__main__":
       run()

**Execute:**

.. code-block:: bash

   crewai run

Output demonstrates sequential processing: greeter creates greeting, poet transforms it into verse.

**Lesson to Remember:** CrewAI CLI automates project scaffolding, establishing conventions that enable rapid development. The standardized structure—config YAML, Python crew definitions, main execution script—provides clear locations for different concerns. This scaffolding acceleration proves particularly valuable when creating multiple crew projects or onboarding new team members.


LiteLLM Integration: Model Flexibility
---------------------------------------

CrewAI leverages LiteLLM for unified access to 100+ language models.


Why LiteLLM Matters
~~~~~~~~~~~~~~~~~~~

Different LLM providers expose different APIs. LiteLLM provides unified interface:

.. code-block:: python

   # Without LiteLLM: Provider-specific code
   from openai import OpenAI
   from anthropic import Anthropic

   openai_client = OpenAI()
   claude_client = Anthropic()

   # Different call patterns
   openai_response = openai_client.chat.completions.create(...)
   claude_response = claude_client.messages.create(...)

   # With LiteLLM: Unified interface
   from litellm import completion

   response = completion(model="gpt-4o", messages=[...])
   response = completion(model="claude-3-5-sonnet-20241022", messages=[...])
   response = completion(model="gemini/gemini-2.0-flash", messages=[...])

CrewAI integrates LiteLLM, enabling any supported model in agent configurations.


Specifying Models in CrewAI
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Format:** `provider/model-name` or just `model-name` for OpenAI

.. code-block:: yaml

   # config/agents.yaml

   openai_agent:
     role: "OpenAI Specialist"
     llm: gpt-4o  # or openai/gpt-4o

   claude_agent:
     role: "Anthropic Specialist"
     llm: anthropic/claude-3-5-sonnet-20241022

   gemini_agent:
     role: "Google Specialist"
     llm: gemini/gemini-2.0-flash

   deepseek_agent:
     role: "DeepSeek Specialist"
     llm: deepseek/deepseek-chat

   ollama_agent:
     role: "Local Specialist"
     llm: ollama/llama3.2

**Environment Variables:**

.. code-block:: bash

   # .env
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...
   DEEPSEEK_API_KEY=...
   # Ollama runs locally, no API key needed


Multi-Model Crews
~~~~~~~~~~~~~~~~~

Single crews can leverage multiple models simultaneously:

.. code-block:: yaml

   # Different models for different roles
   researcher:
     role: "Researcher"
     llm: gpt-4o  # Powerful model for complex research

   analyst:
     role: "Analyst"
     llm: anthropic/claude-3-5-sonnet-20241022  # Claude for analysis

   writer:
     role: "Writer"
     llm: gpt-4o-mini  # Cheaper model for writing

   editor:
     role: "Editor"
     llm: gemini/gemini-2.0-flash  # Free tier for editing

This enables cost optimization: expensive models for complex reasoning, cheaper models for simpler tasks.

**Lesson to Remember:** LiteLLM integration removes model lock-in. Experiment with different providers for different agents. Optimize costs by matching model capabilities to task complexity. Switch providers without code changes—simply update YAML configuration.


Tool Integration: Built-in and Custom
--------------------------------------

Tools extend agent capabilities beyond text generation.


Built-in CrewAI Tools
~~~~~~~~~~~~~~~~~~~~~~

CrewAI provides ready-to-use tools for common tasks:

.. code-block:: python

   from crewai_tools import (
       SerperDevTool,      # Web search via Serper API
       WebsiteSearchTool,  # Search specific websites
       FileReadTool,       # Read local files
       DirectoryReadTool,  # List directory contents
       CodeInterpreterTool,# Execute Python code
       ScrapeWebsiteTool   # Web scraping
   )

   @agent
   def researcher(self) -> Agent:
       return Agent(
           config=self.agents_config['researcher'],
           tools=[
               SerperDevTool(),
               ScrapeWebsiteTool(),
               FileReadTool()
           ]
       )

**SerperDevTool Configuration:**

.. code-block:: bash

   # .env
   SERPER_API_KEY=your_serper_api_key_here

Serper provides Google search results—essential for research agents requiring current information beyond model training data.


Custom Tools
~~~~~~~~~~~~

Create tools for domain-specific capabilities:

.. code-block:: python

   # src/my_crew/tools/financial_tool.py
   from crewai.tools import BaseTool
   from typing import Type
   from pydantic import BaseModel, Field

   class FinancialDataInput(BaseModel):
       """Input for financial data tool."""
       symbol: str = Field(..., description="Stock ticker symbol")

   class FinancialDataTool(BaseTool):
       name: str = "Financial Data Fetcher"
       description: str = (
           "Fetches current financial data for a stock symbol. "
           "Useful for getting real-time prices, market cap, and key metrics."
       )
       args_schema: Type[BaseModel] = FinancialDataInput

       def _run(self, symbol: str) -> str:
           """Execute tool."""
           # Implement actual API call
           import requests
           response = requests.get(
               f"https://api.financialdata.com/quote/{symbol}",
               headers={"Authorization": f"Bearer {os.getenv('FINANCE_API_KEY')}"}
           )
           data = response.json()

           return f"""
           Symbol: {symbol}
           Price: ${data['price']}
           Market Cap: ${data['market_cap']}B
           P/E Ratio: {data['pe_ratio']}
           52-Week Range: ${data['low_52']} - ${data['high_52']}
           """

**Using Custom Tools:**

.. code-block:: python

   from my_crew.tools.financial_tool import FinancialDataTool

   @agent
   def analyst(self) -> Agent:
       return Agent(
           config=self.agents_config['analyst'],
           tools=[FinancialDataTool()]
       )


Structured Outputs with Pydantic
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Force agents to return data in specific formats:

.. code-block:: python

   from pydantic import BaseModel
   from crewai import Crew, Task

   class CompanyAnalysis(BaseModel):
       company_name: str
       ticker: str
       recommendation: str  # "Buy", "Hold", or "Sell"
       target_price: float
       key_strengths: list[str]
       key_risks: list[str]
       confidence: int  # 1-10

   @task
   def analysis_task(self) -> Task:
       return Task(
           config=self.tasks_config['analysis'],
           agent=self.analyst(),
           output_pydantic=CompanyAnalysis  # Enforces structure
       )

   # Execute crew
   result = crew.kickoff(inputs={'company': 'Tesla'})

   # Access structured data
   analysis: CompanyAnalysis = result.pydantic
   print(f"Recommendation: {analysis.recommendation}")
   print(f"Target: ${analysis.target_price}")
   print(f"Confidence: {analysis.confidence}/10")

Structured outputs ensure downstream systems receive predictable, parseable data.

**Lesson to Remember:** Tools transform agents from conversationalists to actors. Built-in tools handle common patterns (web search, file I/O, code execution). Custom tools enable domain-specific capabilities (financial data, CRM integration, database queries). Structured outputs ensure agents return data in machine-consumable formats—critical for production integration.


Sequential vs. Hierarchical Processing
---------------------------------------

Orchestration mode fundamentally changes crew behavior.


Sequential Processing: Predictable Workflows
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Tasks execute in definition order. Simple, deterministic, suitable for clear workflows.

**Example: Research → Analysis → Report Pipeline**

.. code-block:: yaml

   # config/tasks.yaml
   research:
     description: "Research {topic}"
     agent: researcher

   analyze:
     description: "Analyze research findings"
     agent: analyst
     context: [research]

   report:
     description: "Write final report"
     agent: writer
     context: [research, analyze]

.. code-block:: python

   crew = Crew(
       agents=[researcher, analyst, writer],
       tasks=[research, analyze, report],
       process=Process.SEQUENTIAL  # Fixed order execution
   )

**Execution Flow:**

1. Researcher completes research task
2. Analyst receives research output, completes analysis
3. Writer receives research + analysis, produces report

**When to Use:**

- Clear task dependencies
- Predictable workflow order
- No need for dynamic task assignment
- Simpler debugging and monitoring


Hierarchical Processing: Adaptive Coordination
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Manager LLM dynamically assigns tasks based on agent capabilities and current state.

.. code-block:: python

   crew = Crew(
       agents=[researcher, analyst, writer, fact_checker],
       tasks=[research, analyze, verify, report],
       process=Process.HIERARCHICAL,  # Dynamic assignment
       manager_llm="gpt-4o"  # Manager coordinates
   )

**How It Works:**

1. Manager LLM receives all tasks and agent descriptions
2. Manager analyzes which agent best suits each task
3. Manager assigns tasks, potentially in parallel
4. Manager may reassign based on intermediate results
5. Manager synthesizes final output

**When to Use:**

- Uncertain optimal task ordering
- Benefits from parallel execution
- Agents have overlapping capabilities
- Complex workflows where intermediate results inform subsequent steps

**Tradeoffs:**

- **Pros:** Adaptive, potentially more efficient, handles complexity
- **Cons:** Less predictable, harder to debug, additional LLM calls for management


Combining Both Approaches
~~~~~~~~~~~~~~~~~~~~~~~~~

Some crews benefit from hybrid strategies:

.. code-block:: python

   # Phase 1: Hierarchical research (agents explore in parallel)
   research_crew = Crew(
       agents=[researcher1, researcher2, researcher3],
       tasks=[research_task1, research_task2, research_task3],
       process=Process.HIERARCHICAL,
       manager_llm="gpt-4o"
   )

   research_result = research_crew.kickoff(inputs={'topic': 'AI agents'})

   # Phase 2: Sequential analysis (clear pipeline)
   analysis_crew = Crew(
       agents=[analyst, synthesizer, writer],
       tasks=[analyze_task, synthesize_task, write_task],
       process=Process.SEQUENTIAL
   )

   final_result = analysis_crew.kickoff(inputs={'research_data': research_result})

**Lesson to Remember:** Sequential processing offers predictability and simplicity. Hierarchical processing provides adaptiveness and potential parallelism. The choice reflects whether workflow ordering is predetermined or discovered dynamically. Most production systems start sequential, migrate to hierarchical only when complexity demands adaptive coordination.


Memory Systems: Short-term, Long-term, Entity
----------------------------------------------

CrewAI provides three memory types enabling agents to learn and remember.


Short-Term Memory
~~~~~~~~~~~~~~~~~

Maintains conversation context within single crew execution.

.. code-block:: yaml

   researcher:
     role: "Researcher"
     memory: true  # Enable memory
     llm: gpt-4o

With memory enabled, agents remember earlier task outputs and intermediate findings within the current kickoff session.


Long-Term Memory
~~~~~~~~~~~~~~~~

Persists knowledge across crew executions using vector databases.

.. code-block:: python

   from crewai import Crew

   crew = Crew(
       agents=[researcher, analyst],
       tasks=[research, analyze],
       memory=True,  # Enable crew-level memory
       embedder={
           "provider": "openai",
           "config": {
               "model": "text-embedding-3-small"
           }
       }
   )

CrewAI stores task outputs and results in vector database (default: local storage). Subsequent executions retrieve relevant past experiences.


Entity Memory
~~~~~~~~~~~~~

Tracks specific entities (people, companies, concepts) across executions.

.. code-block:: python

   crew = Crew(
       agents=[analyst],
       tasks=[analyze],
       memory=True,
       entity_memory=True  # Track entities
   )

When agent encounters "Tesla" in multiple sessions, entity memory consolidates all Tesla-related information for retrieval.


Configuring Memory Storage
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   from crewai import Crew

   crew = Crew(
       agents=[...],
       tasks=[...],
       memory=True,
       memory_config={
           "provider": "chroma",  # or "pinecone", "weaviate"
           "config": {
               "collection_name": "financial_analysis",
               "embedding_model": "text-embedding-3-small"
           }
       }
   )

**Lesson to Remember:** Memory systems enable agents to build on past experiences. Short-term memory maintains conversation context. Long-term memory retrieves relevant historical executions. Entity memory tracks specific subjects across sessions. These capabilities transform stateless agents into learning systems, improving performance with usage.


Related Projects Using CrewAI
------------------------------

**Hands-On Implementations:**

- **Stock Picker Agent** - Week 3 Project: Multi-agent investment analysis system with financial data tools and structured recommendations
- **Engineering Team** - Week 3 Project: Four-agent software development crew (manager, frontend dev, backend dev, tester) collaboratively building applications

**Framework Comparisons:**

- **OpenAI Agents SDK** - Week 2: Lightweight code-first approach
- **LangGraph** - Week 4: Graph-based state management


Conclusion: Configuration Meets Power
--------------------------------------

CrewAI demonstrates that configuration-driven development need not sacrifice capability. YAML files define complex multi-agent systems. Role-based agents with rich backstories shape outputs. Task-centric workflows separate concerns cleanly. Sequential and hierarchical processing modes handle simple and complex coordination.

The framework's opinionated design guides toward proven patterns. This guidance accelerates development when requirements align with framework assumptions—role-based teams, task-oriented workflows, clear specialist responsibilities. The configuration approach particularly benefits teams with mixed technical backgrounds: YAML remains accessible to domain experts who might struggle with Python agent instantiation.

Yet opinions become constraints when requirements diverge from established patterns. Custom orchestration logic requires navigating framework abstractions. Unusual agent coordination patterns may fight against built-in structures. The tradeoff proves acceptable for most applications—configuration handles standard cases, custom tools handle exceptions.

CrewAI's integration with LiteLLM removes model lock-in, enabling experimentation across 100+ language models. Built-in tools (web search, file I/O, code execution) accelerate common patterns. Custom tools enable domain-specific capabilities. Memory systems allow agents to learn from experience.

The framework occupies valuable space in the ecosystem: more structure than OpenAI Agents SDK, less complexity than LangGraph. For teams building multi-agent systems following role-based patterns, CrewAI delivers productivity gains without excessive learning curves.

Configuration-driven frameworks succeed when their opinions match problem structures. CrewAI's opinions—specialists collaborating on tasks, explicit role definitions, declarative workflows—align with many real-world multi-agent scenarios. This alignment explains the framework's popularity among practitioners seeking productive middle ground between code flexibility and configuration velocity.

Simple YAML, powerful capabilities. The combination proves compelling.


Resources & Further Learning
-----------------------------

**Official Documentation:**

- CrewAI Documentation: https://docs.crewai.com
- GitHub Repository: https://github.com/joaomdmoura/crewai
- Course Code: https://github.com/ed-donner/agents/tree/main/week-3-crew

**Related Materials:**

- LiteLLM Documentation: https://docs.litellm.ai/docs/
- Serper API: https://serper.dev
- Project Examples: Stock Picker Agent, Engineering Team

---

*This framework guide establishes foundation for Week 3 projects. Proceed to Stock Picker or Engineering Team implementations for hands-on application of CrewAI in production systems.*

