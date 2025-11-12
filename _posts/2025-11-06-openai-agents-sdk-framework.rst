---
layout: post
title: "(Agentic AI Framework) OpenAI Agents SDK: Lightweight Python Agent Creation"
date: 2025-11-12 00:00:00 +0530
categories: [ai, agents, openai]
tags: [agentic-ai, openai-agents-sdk, swarm, async-python, agent-orchestration, tool-calling, handoffs]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Master OpenAI's elegant Agents SDK (formerly Swarm) - a lightweight, un-opinionated framework for building autonomous agents with tools, handoffs, and async orchestration in pure Python."
image:
  path: /attachments/posts/2025-11-12-openai-agents-sdk-framework/images/preview_art.png
  alt: "OpenAI Agents SDK Framework Overview"
allow_edit: true
---


OpenAI Agents SDK: Lightweight Python Agent Creation
=====================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 2


Preface: The Elegance of Simplicity
------------------------------------

The agentic AI landscape presents a curious paradox: powerful capabilities often buried beneath layers of abstraction, terminology, and opinionated design patterns. Frameworks compete to offer the most features, the deepest integrations, the most comprehensive ecosystems. Complexity compounds.

OpenAI's Agents SDK emerges as counterpoint—a framework distinguished not by what it includes, but by what it omits. Formerly known as Swarm before broader adoption, this lightweight library strips agent creation to its essence: models, tools, handoffs, and orchestration. No prescribed architectures. No rigid workflows. No learning curve that spans days.

The philosophy proves refreshing: provide just enough structure to eliminate boilerplate while preserving complete flexibility in design decisions. Tool definitions reduce from verbose JSON dictionaries to simple Python functions with decorators. Agent-to-agent communication becomes a single method call. Tracing and debugging arrive built-in, requiring zero configuration.

This minimalism carries profound implications. Engineers accustomed to wrestling with framework opinions discover they can simply... build. The cognitive overhead evaporates. Focus shifts from learning framework patterns to solving actual problems. Speed increases dramatically—prototypes emerge in minutes, production systems in hours.

Yet simplicity should not imply limited capability. The SDK supports sophisticated multi-agent systems, parallel execution through Python's asyncio, structured outputs with Pydantic, and seamless integration with OpenAI's full model suite. Complex behaviors emerge from combining simple primitives rather than navigating complex APIs.

This document explores OpenAI Agents SDK systematically—from core concepts through practical implementation, from single-agent patterns to multi-agent orchestration. The journey reveals how frameworks serve best when they dissolve into the background, allowing focus on the architecture that matters: solving meaningful problems with autonomous agents.


.. code-block:: mermaid

   mindmap
     root((OpenAI Agents SDK))
       Core Components
         Agent Class
         Runner Class
         Trace Class
         Result Object
       Agent Capabilities
         Tools
         Handoffs
         Instructions
         Model Selection
       Execution Patterns
         Single Agent
         Multi Agent
         Parallel Async
         Sequential Workflow
       Tool Integration
         Function Decorator
         Agents as Tools
         Structured Outputs
       Advanced Features
         Built-in Tracing
         Context Sharing
         Error Handling


Framework Philosophy and Positioning
-------------------------------------

Understanding where OpenAI Agents SDK fits within the framework spectrum illuminates when to choose it.


The Framework Complexity Spectrum
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Agent frameworks arrange themselves along a complexity gradient:

**Minimal (Bottom):**

- **No Framework** - Direct API calls, manual orchestration (Week 1 approach)
- **OpenAI Agents SDK** - Thin abstraction layer, maximum flexibility

**Low-Code (Middle):**

- **CrewAI** - Configuration-driven, YAML-based agent definition
- **Microsoft Autogen** - Structured conversation patterns

**Computational (Top):**

- **LangGraph** - Graph-based workflows with state management
- **LangChain** - Comprehensive ecosystem with extensive integrations

OpenAI Agents SDK occupies the second position deliberately—just barely above raw API calls, yet providing essential conveniences that dramatically accelerate development.


What "Un-opinionated" Means in Practice
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The term "opinionated framework" describes systems that enforce specific patterns and structures. OpinionATED frameworks say: "This is how you should organize agents. This is how tools must be defined. This is the correct way to handle state."

OpenAI Agents SDK takes the opposite stance: "Here are primitives. Combine them however serves your needs."

**Practical Implications:**

No required directory structures. No mandatory YAML configuration files. No base classes to inherit from. No framework-specific terminology to learn beyond four core concepts.

This flexibility proves valuable when:

- Building proofs-of-concept that need to ship quickly
- Integrating with existing codebases that have established patterns
- Experimenting with novel agent architectures
- Preferring explicit code over implicit framework magic

The tradeoff: less hand-holding. CrewAI might guide toward specific multi-agent patterns through configuration. Agents SDK expects engineers to design their own patterns.


When to Choose OpenAI Agents SDK
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Optimal Use Cases:**

- **Rapid Prototyping:** Need to validate an agentic concept in hours, not days
- **Production Systems:** Want full control over architecture and execution flow
- **Team Familiarity:** Engineers comfortable with Python and async patterns
- **Lightweight Requirements:** Don't need LangChain's vast integration ecosystem
- **OpenAI Focus:** Primary reliance on OpenAI models with occasional alternatives

**Consider Alternatives When:**

- **Configuration Preferred:** CrewAI's YAML approach better fits team workflows
- **Graph Workflows Essential:** LangGraph's state machines match problem structure
- **Extensive Integrations Needed:** LangChain's ecosystem provides immediate value
- **Learning Framework is Goal:** Autogen's patterns worth mastering for long-term projects


Comparison Matrix
~~~~~~~~~~~~~~~~~

.. code-block:: text

   Framework     | Complexity | Setup Time | Flexibility | Best For
   --------------|------------|------------|-------------|------------------
   Agents SDK    | Very Low   | < 5 min    | Very High   | Fast prototypes
   CrewAI        | Low        | ~15 min    | Medium      | Team coordination
   Autogen       | Medium     | ~30 min    | Medium      | Conversations
   LangGraph     | High       | ~60 min    | High        | Complex workflows
   LangChain     | Very High  | Variable   | Low         | Full ecosystem

**Lesson to Remember:** Framework selection mirrors architectural philosophy. OpenAI Agents SDK trusts engineers to make design decisions, providing tools without prescription. This trust enables velocity when wielded by practitioners comfortable with the responsibility that accompanies flexibility.


Core Concepts and Components
-----------------------------

Four classes form the SDK's complete API surface. Mastering these unlocks the entire framework.


The Agent Class
~~~~~~~~~~~~~~~

Agents represent autonomous entities with specific capabilities and instructions.

**Defining an Agent:**

.. code-block:: python

   from openai_agents import Agent

   research_agent = Agent(
       name="research_specialist",
       instructions="You are an expert researcher. Gather comprehensive "
                    "information from provided sources. Synthesize findings "
                    "into clear, structured reports.",
       model="gpt-4o",
       tools=[search_tool, analyze_tool],  # Optional: agent capabilities
       handoffs=[analyst_agent]             # Optional: delegation targets
   )

**Key Properties:**

- **name**: Identifier for tracing and debugging (shows in logs)
- **instructions**: System prompt defining agent's role and behavior
- **model**: LLM to use (`gpt-4o`, `gpt-4o-mini`, `o3-mini`, etc.)
- **tools**: Functions agent can execute (explained below)
- **handoffs**: Other agents this agent can delegate to

Agents remain stateless by design. Each execution receives fresh context, preventing hidden state bugs that plague stateful systems.


The Runner Class
~~~~~~~~~~~~~~~~

Runners orchestrate agent execution, managing the conversation loop and tool calls.

**Basic Execution:**

.. code-block:: python

   from openai_agents import Runner

   runner = Runner()

   result = runner.run(
       agent=research_agent,
       input="Analyze recent developments in quantum computing.",
       context={"user_id": "researcher_42"}  # Optional shared context
   )

   print(result.output)  # Final agent response
   print(result.trace)   # Execution trace for debugging

**Async Execution for Concurrency:**

.. code-block:: python

   import asyncio

   async def run_multiple_agents():
       """Execute multiple agent tasks concurrently."""
       runner = Runner()

       tasks = [
           runner.run_async(agent=agent1, input="Task 1"),
           runner.run_async(agent=agent2, input="Task 2"),
           runner.run_async(agent=agent3, input="Task 3")
       ]

       results = await asyncio.gather(*tasks)
       return results

   # Run from synchronous context
   results = asyncio.run(run_multiple_agents())

Runners handle the complete request-response cycle:

1. Send input to agent's model with instructions
2. Receive response (possibly with tool calls)
3. Execute any requested tools
4. Send tool results back to model
5. Repeat until model provides final answer
6. Return complete Result object with output and trace


The Trace Class
~~~~~~~~~~~~~~~

Tracing provides visibility into agent decision-making—essential for debugging and optimization.

**Automatic Tracing:**

Every `runner.run()` call automatically generates a trace capturing:

- All messages exchanged with models
- Tool calls requested by agents
- Tool execution results
- Token usage per call
- Timing information
- Errors and exceptions

**Accessing Traces:**

.. code-block:: python

   result = runner.run(agent=my_agent, input="Solve problem X")

   # Print formatted trace
   print(result.trace)

   # Access structured trace data
   for step in result.trace.steps:
       print(f"Step: {step.agent_name}")
       print(f"Tokens: {step.tokens_used}")
       print(f"Duration: {step.duration_ms}ms")
       if step.tool_calls:
           for tool_call in step.tool_calls:
               print(f"  Called: {tool_call.name}({tool_call.arguments})")
               print(f"  Result: {tool_call.result}")

Traces enable:

- **Debugging:** See exactly what agents decided and why
- **Optimization:** Identify expensive calls or unnecessary tool executions
- **Monitoring:** Track token usage and costs in production
- **Auditing:** Maintain records of agent behavior for compliance


The Result Object
~~~~~~~~~~~~~~~~~

Results encapsulate everything returned from agent execution.

.. code-block:: python

   class Result:
       output: str                    # Final agent response
       trace: Trace                   # Complete execution trace
       agent: Agent                   # Agent that provided final response
       context: dict                  # Shared context (if used)
       metadata: dict                 # Additional execution metadata

**Practical Usage:**

.. code-block:: python

   result = runner.run(agent=analyst, input="Summarize Q4 earnings")

   # Get final answer
   answer = result.output

   # Check which agent responded (relevant for handoffs)
   final_agent = result.agent.name

   # Extract context for next turn
   conversation_context = result.context

   # Log token usage for cost tracking
   total_tokens = sum(step.tokens_used for step in result.trace.steps)
   print(f"Cost analysis: {total_tokens} tokens used")

Results provide everything needed for both immediate use (the output) and subsequent analysis (trace, metadata).

**Lesson to Remember:** The four core classes—Agent, Runner, Trace, Result—comprise OpenAI Agents SDK's complete API. No hidden abstractions, no surprise behaviors, no framework magic beyond these transparent primitives. This simplicity allows focus on agent logic rather than framework navigation.


Installation and Setup
----------------------

Environment preparation takes minutes, not hours.


Prerequisites
~~~~~~~~~~~~~

**Python Environment:**

- Python 3.10+ (3.12 recommended)
- UV package manager (fast, recommended) or pip
- Virtual environment capability

**API Access:**

- OpenAI API key (required)
- Optional: Anthropic, Google, DeepSeek keys for multi-model scenarios


Setup with UV (Recommended)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

UV provides dramatically faster package installation compared to pip or conda.

.. code-block:: bash

   # Install UV if not already installed
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Create project directory
   mkdir my-agent-project
   cd my-agent-project

   # Initialize with UV
   uv init

   # Add OpenAI Agents SDK
   uv add openai-agents

   # Add supporting packages
   uv add python-dotenv pydantic

UV automatically creates a virtual environment, installs dependencies, and maintains a `uv.lock` file for reproducible builds.


Setup with Pip (Alternative)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Create virtual environment
   python -m venv .venv

   # Activate (macOS/Linux)
   source .venv/bin/activate

   # Activate (Windows)
   .venv\Scripts\activate

   # Install packages
   pip install openai-agents python-dotenv pydantic


API Key Configuration
~~~~~~~~~~~~~~~~~~~~~

Store API keys in a `.env` file at project root:

.. code-block:: bash

   # .env file
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

**Load in Python:**

.. code-block:: python

   from dotenv import load_dotenv
   import os

   # Load environment variables (override existing with .env values)
   load_dotenv(override=True)

   # Verify key exists
   if not os.getenv("OPENAI_API_KEY"):
       raise EnvironmentError("OPENAI_API_KEY not set in environment")

   print("✓ API keys loaded successfully")

The `override=True` parameter ensures `.env` file values take precedence over system environment variables—critical for avoiding confusion when keys exist in multiple locations.


Verification
~~~~~~~~~~~~

Confirm setup with a minimal agent:

.. code-block:: python

   from openai_agents import Agent, Runner
   from dotenv import load_dotenv

   load_dotenv(override=True)

   # Create simple agent
   agent = Agent(
       name="test_agent",
       instructions="You are a helpful assistant.",
       model="gpt-4o-mini"
   )

   # Execute
   runner = Runner()
   result = runner.run(agent=agent, input="Say hello!")

   print(result.output)  # Should respond with greeting
   print(f"✓ SDK working, used {len(result.trace.steps)} steps")

Success confirms: Python environment active, packages installed, API key valid, SDK functional.

**Lesson to Remember:** Setup simplicity reflects framework philosophy. No complex configuration files, no framework-specific project structures, no multi-step initialization rituals. Install package, set API key, write code. The barrier between intention and implementation dissolves.


Tool Integration: From Functions to Capabilities
-------------------------------------------------

Tools transform agents from conversationalists to actors, enabling real-world interaction.


Understanding Tool Mechanics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Recall the fundamental reality from Week 1: tool calling reduces to JSON descriptions and conditional execution. The agent receives function schemas, responds with requested calls, code executes functions, results return to agent.

OpenAI Agents SDK eliminates the JSON boilerplate through Python decorators.


Defining Tools with Decorators
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Simple Function Tool:**

.. code-block:: python

   from openai_agents import tool

   @tool
   def calculate_compound_interest(
       principal: float,
       rate: float,
       years: int
   ) -> float:
       """Calculate compound interest.

       Args:
           principal: Initial investment amount
           rate: Annual interest rate (as decimal, e.g., 0.05 for 5%)
           years: Number of years to compound

       Returns:
           Final amount after compound interest
       """
       return principal * (1 + rate) ** years

The `@tool` decorator:

1. Extracts function signature for type information
2. Parses docstring for descriptions
3. Generates JSON schema automatically
4. Registers function for execution when agent requests it

**Using Tools in Agents:**

.. code-block:: python

   financial_agent = Agent(
       name="financial_advisor",
       instructions="You help users understand investment returns. "
                    "Use the compound interest calculator when needed.",
       model="gpt-4o",
       tools=[calculate_compound_interest]
   )

   runner = Runner()
   result = runner.run(
       agent=financial_agent,
       input="If I invest $10,000 at 7% for 30 years, what will I have?"
   )

   print(result.output)
   # Agent automatically calls tool, receives result, formulates answer

The agent detects the question requires calculation, requests tool execution, receives `$76,122.55`, and generates natural language response incorporating the result.


Tools with External Dependencies
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Real tools often interact with APIs, databases, or external services.

**Example: Web Search Tool**

.. code-block:: python

   import requests
   from openai_agents import tool

   @tool
   def search_web(query: str, max_results: int = 5) -> list[dict]:
       """Search the web for information.

       Args:
           query: Search query string
           max_results: Maximum number of results to return (default 5)

       Returns:
           List of search results with titles, URLs, and snippets
       """
       # Example using hypothetical search API
       response = requests.get(
           "https://api.searchprovider.com/search",
           params={"q": query, "limit": max_results},
           headers={"Authorization": f"Bearer {os.getenv('SEARCH_API_KEY')}"}
       )

       return response.json()["results"]

   research_agent = Agent(
       name="researcher",
       instructions="You research topics thoroughly using web search. "
                    "Search multiple times with different queries to get "
                    "comprehensive information.",
       model="gpt-4o",
       tools=[search_web]
   )

Agents can now access real-time web information, transforming from closed-knowledge systems to connected researchers.


Structured Outputs as Implicit Tools
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Pydantic models enable type-safe, validated responses—particularly valuable for data extraction.

.. code-block:: python

   from pydantic import BaseModel
   from openai_agents import Agent, Runner

   class CompanyAnalysis(BaseModel):
       company_name: str
       industry: str
       key_strengths: list[str]
       key_risks: list[str]
       investment_recommendation: str
       confidence_level: int  # 1-10 scale

   analyst_agent = Agent(
       name="equity_analyst",
       instructions="You analyze companies and provide investment insights. "
                    "Always structure your analysis using the provided format.",
       model="gpt-4o",
       response_format=CompanyAnalysis  # SDK handles structured output
   )

   runner = Runner()
   result = runner.run(
       agent=analyst_agent,
       input="Analyze Tesla's current investment potential"
   )

   # Result automatically parsed into Pydantic model
   analysis: CompanyAnalysis = result.output_structured

   print(f"Company: {analysis.company_name}")
   print(f"Recommendation: {analysis.investment_recommendation}")
   print(f"Confidence: {analysis.confidence_level}/10")
   print(f"Strengths: {', '.join(analysis.key_strengths)}")

Structured outputs ensure agents return data in programmatically consumable formats—critical for integration with downstream systems.


Agents as Tools
~~~~~~~~~~~~~~~

The SDK's most elegant feature: any agent can become a tool for another agent.

.. code-block:: python

   # Specialist agents
   market_analyst = Agent(
       name="market_analyst",
       instructions="You analyze market trends and conditions.",
       model="gpt-4o"
   )

   financial_analyst = Agent(
       name="financial_analyst",
       instructions="You analyze company financials and statements.",
       model="gpt-4o"
   )

   sentiment_analyst = Agent(
       name="sentiment_analyst",
       instructions="You analyze news sentiment and public perception.",
       model="gpt-4o"
   )

   # Convert agents to tools
   market_tool = market_analyst.as_tool()
   financial_tool = financial_analyst.as_tool()
   sentiment_tool = sentiment_analyst.as_tool()

   # Orchestrator agent with specialist tools
   investment_manager = Agent(
       name="investment_manager",
       instructions="You coordinate specialist analysts to make investment "
                    "recommendations. Consult market, financial, and sentiment "
                    "analysts before making recommendations.",
       model="gpt-4o",
       tools=[market_tool, financial_tool, sentiment_tool]
   )

   # Execute
   result = runner.run(
       agent=investment_manager,
       input="Should we invest in renewable energy stocks right now?"
   )

The investment manager autonomously decides which specialist agents to consult, orchestrating a multi-agent analysis without explicit workflow definition.

**Lesson to Remember:** Tools transform declarative functions into agent capabilities through decorator magic. The `@tool` decorator eliminates boilerplate while preserving flexibility. Converting agents to tools enables hierarchical architectures where orchestrators leverage specialists—complex behaviors emerging from simple composition.


Handoffs: Agent-to-Agent Delegation
------------------------------------

While agents-as-tools provide one collaboration pattern, handoffs offer another—full delegation rather than function-call consultation.


Handoffs vs. Agents-as-Tools
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The distinction proves subtle but important:

**Agents as Tools:**
- Parent agent remains in control
- Specialist agent executes specific task
- Result returns to parent
- Parent continues processing
- Pattern: "Ask specialist a question, incorporate answer"

**Handoffs:**
- Parent agent fully delegates control
- Specialist agent takes over conversation
- Specialist can use own tools and make own handoffs
- Original agent may or may not regain control
- Pattern: "Transfer conversation to specialist"

.. code-block:: mermaid

   graph LR
       A[User] --> B[Triage Agent]
       B -->|Technical Issue| C[Tech Support Agent]
       B -->|Billing Issue| D[Billing Agent]
       B -->|Account Issue| E[Account Agent]
       C -->|Needs Escalation| F[Senior Tech]
       D --> G[Resolution]
       E --> G
       F --> G
       G --> A


Implementing Handoffs
~~~~~~~~~~~~~~~~~~~~~~

**Support Routing Example:**

.. code-block:: python

   from openai_agents import Agent, Runner

   # Specialist agents
   tech_support = Agent(
       name="tech_support",
       instructions="You resolve technical issues with products. "
                    "Ask diagnostic questions and provide solutions.",
       model="gpt-4o",
       tools=[check_system_status, restart_service, escalate_ticket]
   )

   billing_support = Agent(
       name="billing_support",
       instructions="You handle billing inquiries, refunds, and payments.",
       model="gpt-4o",
       tools=[check_payment_history, process_refund, update_billing]
   )

   # Triage agent with handoffs
   triage_agent = Agent(
       name="triage",
       instructions="You greet customers and route them to appropriate support. "
                    "Handoff to tech_support for technical issues, "
                    "billing_support for billing questions.",
       model="gpt-4o-mini",  # Cheaper model for routing
       handoffs=[tech_support, billing_support]
   )

   # User interaction
   runner = Runner()
   result = runner.run(
       agent=triage_agent,
       input="My app keeps crashing when I try to upload photos"
   )

   # Check which agent handled the request
   print(f"Final agent: {result.agent.name}")  # "tech_support"
   print(result.output)  # Tech support's diagnostic response

The triage agent analyzes the input, determines technical nature, and executes handoff to `tech_support`. The `Runner` automatically switches context to the new agent, which continues the conversation.


Multi-Turn Conversations with Handoffs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Maintaining conversation state across turns requires passing context:

.. code-block:: python

   from openai_agents import Runner

   runner = Runner()
   conversation_context = {}

   # Turn 1: Initial contact
   result1 = runner.run(
       agent=triage_agent,
       input="I need help with my account",
       context=conversation_context
   )

   # Update context with conversation history
   conversation_context = result1.context
   print(f"Agent: {result1.agent.name}")
   print(f"Response: {result1.output}\n")

   # Turn 2: Follow-up (continues with same agent via context)
   result2 = runner.run(
       agent=result1.agent,  # Continue with agent from result1
       input="I can't remember my password",
       context=conversation_context
   )

   conversation_context = result2.context
   print(f"Agent: {result2.agent.name}")
   print(f"Response: {result2.output}")

Context preservation enables agents to maintain awareness of prior conversation, essential for coherent multi-turn interactions.


When to Use Each Pattern
~~~~~~~~~~~~~~~~~~~~~~~~~

**Choose Agents-as-Tools When:**

- Parent needs to synthesize multiple specialist inputs
- Specialists provide information, parent makes decisions
- Clear orchestrator-worker hierarchy exists
- Example: Investment manager consulting market, financial, sentiment analysts

**Choose Handoffs When:**

- Specialists handle complete workflows independently
- No need for parent to post-process specialist output
- Natural conversation routing (customer support, triage)
- Example: Support triage routing to billing, technical, or account specialists

Both patterns can combine in single systems—triage agent uses handoffs for routing, technical specialist uses agents-as-tools for consulting knowledge bases.

**Lesson to Remember:** Handoffs enable full delegation, transferring conversational control between specialists. This differs from agents-as-tools, where orchestrators consult specialists but maintain control. The pattern selection reflects whether synthesis or routing better models the problem domain.


Async Execution for Concurrency
--------------------------------

Python's asyncio unlocks parallel agent execution—critical for performance at scale.


Why Async Matters for Agents
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Agent operations are I/O-bound: waiting for API responses dominates execution time. Running three agents sequentially that each take 2 seconds means 6 seconds total. Running them concurrently means 2 seconds total.

Asyncio enables this through cooperative multitasking—agents yield control while waiting for responses, allowing other agents to execute.


Async Basics Refresher
~~~~~~~~~~~~~~~~~~~~~~~

**Key Concepts:**

- **async def**: Defines coroutine (async function)
- **await**: Pauses execution until async operation completes
- **asyncio.gather()**: Runs multiple coroutines concurrently
- **asyncio.run()**: Entry point from synchronous code

.. code-block:: python

   import asyncio

   async def fetch_data(source: str, delay: float):
       """Simulate fetching data with network delay."""
       print(f"Starting fetch from {source}")
       await asyncio.sleep(delay)  # Simulates I/O wait
       print(f"Completed fetch from {source}")
       return f"Data from {source}"

   async def main():
       # Sequential (6 seconds total)
       data1 = await fetch_data("Source 1", 2)
       data2 = await fetch_data("Source 2", 2)
       data3 = await fetch_data("Source 3", 2)

       # Concurrent (2 seconds total)
       results = await asyncio.gather(
           fetch_data("Source 1", 2),
           fetch_data("Source 2", 2),
           fetch_data("Source 3", 2)
       )
       return results

   # Run from synchronous context
   results = asyncio.run(main())


Async Agent Execution
~~~~~~~~~~~~~~~~~~~~~~

The `Runner` class provides async variants of all methods:

.. code-block:: python

   from openai_agents import Agent, Runner
   import asyncio

   # Create multiple agents
   agents = [
       Agent(name=f"analyst_{i}", instructions="Analyze data.", model="gpt-4o-mini")
       for i in range(3)
   ]

   async def analyze_concurrent(topics: list[str]):
       """Run multiple analyses concurrently."""
       runner = Runner()

       tasks = [
           runner.run_async(agent=agent, input=topic)
           for agent, topic in zip(agents, topics)
       ]

       results = await asyncio.gather(*tasks)
       return results

   # Execute
   topics = [
       "Analyze renewable energy trends",
       "Analyze semiconductor supply chain",
       "Analyze remote work adoption"
   ]

   results = asyncio.run(analyze_concurrent(topics))

   for result in results:
       print(f"{result.agent.name}: {result.output[:100]}...")

Three analyses execute in parallel, dramatically reducing total runtime.


Practical Async Patterns
~~~~~~~~~~~~~~~~~~~~~~~~~

**Pattern 1: Fan-Out, Fan-In (Multiple Specialists)**

.. code-block:: python

   async def multi_perspective_analysis(topic: str):
       """Get analysis from multiple specialist perspectives."""
       runner = Runner()

       # Define specialist agents
       technical = Agent(name="technical", instructions="Technical analysis", model="gpt-4o")
       business = Agent(name="business", instructions="Business analysis", model="gpt-4o")
       market = Agent(name="market", instructions="Market analysis", model="gpt-4o")

       # Run all specialists concurrently
       results = await asyncio.gather(
           runner.run_async(technical, f"Technical analysis of {topic}"),
           runner.run_async(business, f"Business analysis of {topic}"),
           runner.run_async(market, f"Market analysis of {topic}")
       )

       # Synthesize with coordinator agent
       coordinator = Agent(
           name="coordinator",
           instructions="Synthesize multiple analyses into unified report.",
           model="gpt-4o"
       )

       synthesis_input = "\n\n".join([
           f"{result.agent.name}: {result.output}"
           for result in results
       ])

       final_result = await runner.run_async(
           coordinator,
           f"Synthesize these analyses:\n\n{synthesis_input}"
       )

       return final_result

**Pattern 2: Async Tool Execution**

Tools themselves can be async when they perform I/O:

.. code-block:: python

   import aiohttp
   from openai_agents import tool

   @tool
   async def fetch_stock_price(symbol: str) -> dict:
       """Fetch current stock price from financial API.

       Args:
           symbol: Stock ticker symbol (e.g., 'AAPL')

       Returns:
           Dictionary with price data
       """
       async with aiohttp.ClientSession() as session:
           async with session.get(
               f"https://api.financialdata.com/quote/{symbol}",
               headers={"Authorization": f"Bearer {os.getenv('FINANCE_API_KEY')}"}
           ) as response:
               return await response.json()

   # Agent automatically handles async tool execution
   trader_agent = Agent(
       name="trader",
       instructions="You monitor stock prices and make trading decisions.",
       model="gpt-4o",
       tools=[fetch_stock_price]
   )

The Runner automatically detects async tools and executes them appropriately within the event loop.


Error Handling in Async Contexts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   async def robust_multi_agent_execution(agents: list[Agent], inputs: list[str]):
       """Execute multiple agents with error handling."""
       runner = Runner()

       async def safe_run(agent: Agent, input: str):
           try:
               result = await runner.run_async(agent, input)
               return {"success": True, "result": result}
           except Exception as e:
               return {"success": False, "error": str(e), "agent": agent.name}

       tasks = [safe_run(agent, input) for agent, input in zip(agents, inputs)]
       results = await asyncio.gather(*tasks)

       # Process results
       successes = [r["result"] for r in results if r["success"]]
       failures = [r for r in results if not r["success"]]

       if failures:
           print(f"Failed agents: {[f['agent'] for f in failures]}")

       return successes

**Lesson to Remember:** Async execution transforms I/O-bound agent operations from sequential bottlenecks to concurrent execution. Python's asyncio, combined with the SDK's async-aware Runner, enables running multiple agents in parallel—critical for performance in production systems handling multiple concurrent requests.


Advanced Patterns and Best Practices
-------------------------------------

Production systems demand patterns beyond basic agent creation.


Context Sharing Across Agents
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The `context` parameter enables state sharing without global variables:

.. code-block:: python

   from openai_agents import Agent, Runner

   runner = Runner()

   # Initial context
   shared_context = {
       "user_id": "user_12345",
       "session_id": "sess_abcdef",
       "conversation_history": [],
       "user_preferences": {"formality": "casual"}
   }

   # First agent interaction
   result1 = runner.run(
       agent=triage_agent,
       input="I need technical help",
       context=shared_context
   )

   # Context automatically updated with conversation
   updated_context = result1.context
   updated_context["technical_issue_detected"] = True

   # Second agent receives enriched context
   result2 = runner.run(
       agent=tech_support_agent,
       input="The app crashes on startup",
       context=updated_context
   )

   # Tech support agent can access user_id, preferences, history
   print(result2.context["conversation_history"])

Context enables agents to access user information, preferences, and conversation history without database queries or global state.


Guardrails and Validation
~~~~~~~~~~~~~~~~~~~~~~~~~~

Production agents require safety constraints:

.. code-block:: python

   from pydantic import BaseModel, validator
   from openai_agents import Agent, Runner

   class SafeResponse(BaseModel):
       content: str
       contains_pii: bool
       toxicity_score: float

       @validator("toxicity_score")
       def validate_toxicity(cls, v):
           if v > 0.7:
               raise ValueError("Response toxicity exceeds threshold")
           return v

       @validator("contains_pii")
       def validate_pii(cls, v):
           if v:
               raise ValueError("Response contains PII")
           return v

   # Evaluation agent checks responses
   evaluator = Agent(
       name="evaluator",
       instructions="You evaluate responses for safety, checking for PII "
                    "and inappropriate content. Rate toxicity 0.0-1.0.",
       model="gpt-4o-mini",
       response_format=SafeResponse
   )

   def safe_agent_run(agent: Agent, input: str, max_retries: int = 2) -> str:
       """Run agent with safety validation."""
       runner = Runner()

       for attempt in range(max_retries):
           # Generate response
           result = runner.run(agent=agent, input=input)

           # Evaluate safety
           eval_result = runner.run(
               agent=evaluator,
               input=f"Evaluate this response: {result.output}"
           )

           safety_check: SafeResponse = eval_result.output_structured

           try:
               # Pydantic validators raise if unsafe
               if not safety_check.contains_pii and safety_check.toxicity_score < 0.7:
                   return result.output
           except ValueError as e:
               print(f"Attempt {attempt + 1} failed safety check: {e}")
               if attempt < max_retries - 1:
                   # Retry with stricter instructions
                   agent.instructions += "\n\nIMPORTANT: Ensure response contains no PII and maintains professional tone."
               else:
                   return "Unable to generate safe response. Please contact support."

This evaluator-optimizer pattern from Week 1 applies with SDK convenience.


Token Usage Optimization
~~~~~~~~~~~~~~~~~~~~~~~~

Monitor and optimize costs through trace analysis:

.. code-block:: python

   def analyze_agent_efficiency(agent: Agent, test_inputs: list[str]):
       """Profile agent token usage across test cases."""
       runner = Runner()

       total_tokens = 0
       total_cost = 0.0

       # Pricing (example rates)
       COST_PER_1K_TOKENS = {
           "gpt-4o": 0.03,
           "gpt-4o-mini": 0.00015,
           "o3-mini": 0.015
       }

       for input in test_inputs:
           result = runner.run(agent=agent, input=input)

           for step in result.trace.steps:
               tokens = step.tokens_used
               cost = (tokens / 1000) * COST_PER_1K_TOKENS.get(step.model, 0.01)

               total_tokens += tokens
               total_cost += cost

               print(f"Input: {input[:50]}...")
               print(f"  Tokens: {tokens}")
               print(f"  Cost: ${cost:.4f}")

               if step.tool_calls:
                   print(f"  Tools: {[tc.name for tc in step.tool_calls]}")

       print(f"\nTotal tokens: {total_tokens}")
       print(f"Total cost: ${total_cost:.2f}")
       print(f"Avg tokens/query: {total_tokens / len(test_inputs):.0f}")

       return {
           "total_tokens": total_tokens,
           "total_cost": total_cost,
           "average_tokens": total_tokens / len(test_inputs)
       }

Regular profiling identifies opportunities to switch models (GPT-4o → GPT-4o-mini) or optimize prompts.


Error Recovery Strategies
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   from openai_agents import Agent, Runner
   import logging

   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)

   def resilient_agent_run(
       agent: Agent,
       input: str,
       max_retries: int = 3,
       fallback_model: str = "gpt-4o-mini"
   ) -> str:
       """Run agent with retry logic and model fallback."""
       runner = Runner()

       for attempt in range(max_retries):
           try:
               result = runner.run(agent=agent, input=input)
               return result.output

           except Exception as e:
               logger.warning(f"Attempt {attempt + 1} failed: {e}")

               if attempt < max_retries - 1:
                   # Try fallback model
                   if attempt == 1 and agent.model != fallback_model:
                       logger.info(f"Switching to fallback model: {fallback_model}")
                       agent = Agent(
                           name=agent.name,
                           instructions=agent.instructions,
                           model=fallback_model,
                           tools=agent.tools
                       )
               else:
                   logger.error(f"All attempts failed for input: {input}")
                   raise

       return "Unable to process request after multiple attempts."

Production systems benefit from retry logic, fallback models, and comprehensive logging.

**Lesson to Remember:** Advanced patterns—context sharing, guardrails, token optimization, error recovery—transform basic agents into production-ready systems. The SDK's simplicity enables focus on these architectural concerns rather than framework mechanics.


Comparison with Other Frameworks
---------------------------------

Understanding alternatives illuminates when OpenAI Agents SDK excels versus when other frameworks better serve specific needs.


OpenAI Agents SDK vs. CrewAI
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**CrewAI Advantages:**

- Configuration-driven through YAML files
- Built-in role-based agent templates
- Opinionated structure guides architecture
- Lower code volume for standard patterns
- Great for teams preferring declarative approaches

**Agents SDK Advantages:**

- Pure Python, no configuration files
- Complete flexibility in agent design
- Simpler mental model (4 classes)
- Faster prototyping for custom architectures
- Better for developers comfortable with code-first approaches

**When to Choose:**

- **CrewAI**: Team coordination patterns, role-based workflows, configuration preferred
- **Agents SDK**: Rapid prototyping, custom architectures, code-first preference


OpenAI Agents SDK vs. LangGraph
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**LangGraph Advantages:**

- Explicit state management
- Graph-based workflow visualization
- Complex branching and looping logic
- Persistent state across sessions
- Ideal for stateful applications

**Agents SDK Advantages:**

- Dramatically simpler API
- No graph construction required
- Stateless design prevents subtle bugs
- Faster learning curve
- Better for stateless request-response patterns

**When to Choose:**

- **LangGraph**: Complex state machines, stateful workflows, branching logic
- **Agents SDK**: Stateless operations, simpler workflows, faster development


OpenAI Agents SDK vs. Autogen
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Autogen Advantages:**

- Conversation-centric design
- Built-in multi-agent debate patterns
- Code execution sandboxes
- Research-oriented features

**Agents SDK Advantages:**

- Production-ready stability
- Simpler conversation patterns
- Better integration with OpenAI models
- Clearer execution model

**When to Choose:**

- **Autogen**: Multi-agent debates, research applications, code generation
- **Agents SDK**: Production applications, simpler coordination, OpenAI focus


Framework Selection Matrix
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   Use Case                          | Best Framework
   ----------------------------------|------------------
   Rapid prototype in hours          | Agents SDK
   Team-based agent coordination     | CrewAI
   Complex stateful workflows        | LangGraph
   Multi-agent debates               | Autogen
   Production OpenAI integration     | Agents SDK
   Configuration-driven architecture | CrewAI
   Graph-based visualization needs   | LangGraph
   Code generation and execution     | Autogen
   Maximum flexibility               | Agents SDK
   Ecosystem integrations            | LangChain

**Lesson to Remember:** Framework selection mirrors problem structure and team preferences. OpenAI Agents SDK excels in rapid prototyping and production systems where simplicity, flexibility, and OpenAI integration dominate requirements. Alternative frameworks serve when their specific features—CrewAI's configuration, LangGraph's state management, Autogen's debate patterns—directly address problem characteristics.


When to Use OpenAI Agents SDK Commercially
-------------------------------------------

Business contexts reveal framework appropriateness beyond technical considerations.


Ideal Commercial Scenarios
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**1. Customer Support Automation**

Multi-tier support with triage and specialist routing benefits from handoffs:

- Triage agent classifies issues
- Handoffs route to billing, technical, account specialists
- Context preservation maintains conversation continuity
- Async execution handles concurrent user sessions

**2. Content Generation Pipelines**

Multi-stage content creation leverages agents-as-tools:

- Research agent gathers sources (tool)
- Outline agent structures content (tool)
- Writer agent drafts sections
- Editor agent refines output
- All orchestrated by coordinator agent

**3. Financial Analysis Platforms**

Specialist analysts combine for comprehensive reports:

- Market analyst (tool)
- Financial statement analyst (tool)
- Sentiment analyst (tool)
- Risk analyst (tool)
- Portfolio manager orchestrates and synthesizes

**4. Sales Development Representatives**

Automated outreach benefits from tool integration:

- Research prospects (web search tool)
- Analyze company fit (scoring tool)
- Generate personalized emails (composition agent)
- Schedule follow-ups (calendar tool)
- Track responses (CRM tool)


Integration Considerations
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**API-First Architecture:**

The SDK integrates cleanly into existing Python services:

.. code-block:: python

   from fastapi import FastAPI, HTTPException
   from pydantic import BaseModel
   from openai_agents import Agent, Runner

   app = FastAPI()
   runner = Runner()

   # Define agent at startup
   support_agent = Agent(
       name="support",
       instructions="You provide technical support.",
       model="gpt-4o-mini",
       tools=[check_order_status, update_ticket]
   )

   class SupportRequest(BaseModel):
       user_id: str
       message: str
       session_id: str

   @app.post("/api/support")
   async def handle_support(request: SupportRequest):
       """Handle support request via agent."""
       try:
           context = {"user_id": request.user_id, "session_id": request.session_id}
           result = await runner.run_async(
               agent=support_agent,
               input=request.message,
               context=context
           )

           return {
               "response": result.output,
               "agent": result.agent.name,
               "tokens_used": sum(s.tokens_used for s in result.trace.steps)
           }
       except Exception as e:
           raise HTTPException(status_code=500, detail=str(e))

**Database Integration:**

Store conversation history and context:

.. code-block:: python

   import sqlalchemy as sa
   from sqlalchemy.orm import Session

   def persist_conversation(result, db: Session):
       """Store agent interaction in database."""
       conversation = ConversationRecord(
           session_id=result.context["session_id"],
           user_id=result.context["user_id"],
           agent_name=result.agent.name,
           user_input=result.trace.steps[0].input,
           agent_output=result.output,
           tokens_used=sum(s.tokens_used for s in result.trace.steps),
           timestamp=datetime.utcnow()
       )
       db.add(conversation)
       db.commit()


Cost Management
~~~~~~~~~~~~~~~

**Model Selection Strategy:**

.. code-block:: python

   def select_model_by_complexity(input: str) -> str:
       """Choose model based on query complexity."""
       # Simple heuristic: length and question markers
       word_count = len(input.split())
       has_complex_markers = any(marker in input.lower() for marker in [
           "analyze", "compare", "evaluate", "assess", "complex", "detailed"
       ])

       if word_count > 50 or has_complex_markers:
           return "gpt-4o"  # Complex queries need stronger model
       else:
           return "gpt-4o-mini"  # Simple queries use cheaper model

   def dynamic_agent(instructions: str, tools: list):
       """Create agent with dynamic model selection."""
       return lambda input: Agent(
           name="dynamic",
           instructions=instructions,
           model=select_model_by_complexity(input),
           tools=tools
       )

**Budget Enforcement:**

.. code-block:: python

   class BudgetEnforcer:
       """Enforce spending limits on agent operations."""

       def __init__(self, daily_limit_usd: float):
           self.daily_limit = daily_limit_usd
           self.daily_spend = 0.0
           self.reset_date = datetime.utcnow().date()

       def check_budget(self, estimated_cost: float) -> bool:
           """Check if operation within budget."""
           current_date = datetime.utcnow().date()

           # Reset daily counter
           if current_date > self.reset_date:
               self.daily_spend = 0.0
               self.reset_date = current_date

           # Check if operation would exceed limit
           if self.daily_spend + estimated_cost > self.daily_limit:
               return False

           return True

       def record_spend(self, actual_cost: float):
           """Record actual spend after operation."""
           self.daily_spend += actual_cost

   # Usage
   budget = BudgetEnforcer(daily_limit_usd=100.0)

   def safe_agent_run(agent: Agent, input: str):
       """Run agent only if within budget."""
       estimated_tokens = len(input.split()) * 2  # Rough estimate
       estimated_cost = (estimated_tokens / 1000) * 0.00015  # GPT-4o-mini rate

       if not budget.check_budget(estimated_cost):
           return "Daily API budget exceeded. Please try again tomorrow."

       result = runner.run(agent=agent, input=input)

       actual_tokens = sum(s.tokens_used for s in result.trace.steps)
       actual_cost = (actual_tokens / 1000) * 0.00015
       budget.record_spend(actual_cost)

       return result.output


Monitoring and Observability
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Production Monitoring:**

.. code-block:: python

   import logging
   from datadog import statsd

   def monitored_agent_run(agent: Agent, input: str, tags: list[str]):
       """Run agent with comprehensive monitoring."""
       logger = logging.getLogger(__name__)

       start_time = time.time()

       try:
           result = runner.run(agent=agent, input=input)

           duration = time.time() - start_time
           tokens = sum(s.tokens_used for s in result.trace.steps)
           tool_calls = sum(len(s.tool_calls) for s in result.trace.steps if s.tool_calls)

           # Log metrics
           statsd.increment("agent.requests", tags=tags + [f"agent:{agent.name}"])
           statsd.histogram("agent.duration", duration, tags=tags)
           statsd.histogram("agent.tokens", tokens, tags=tags)
           statsd.histogram("agent.tool_calls", tool_calls, tags=tags)

           logger.info(f"Agent {agent.name} completed in {duration:.2f}s, {tokens} tokens")

           return result

       except Exception as e:
           statsd.increment("agent.errors", tags=tags + [f"error:{type(e).__name__}"])
           logger.error(f"Agent {agent.name} failed: {e}", exc_info=True)
           raise

**Lesson to Remember:** Commercial deployment demands considerations beyond agent logic—API integration, database persistence, cost management, monitoring, and budget enforcement. OpenAI Agents SDK's lightweight design integrates cleanly into existing Python services, enabling production deployment without framework lock-in or architectural constraints.


Troubleshooting Common Issues
------------------------------

Production experience reveals recurring challenges and solutions.


Issue: "Agent Not Calling Expected Tool"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Agent generates text response instead of using provided tool.

**Causes & Solutions:**

1. **Unclear Tool Description**

.. code-block:: python

   # Bad: Vague description
   @tool
   def process_data(data: str) -> str:
       """Process data."""  # Too generic
       ...

   # Good: Specific, clear description
   @tool
   def process_data(data: str) -> str:
       """Extract email addresses from provided text.

       Use this tool when user asks to find emails in text, documents,
       or wants email extraction. Returns list of found email addresses.

       Args:
           data: Text content to search for email addresses

       Returns:
           Comma-separated list of email addresses found
       """
       ...

2. **Agent Instructions Don't Mention Tool**

.. code-block:: python

   # Bad: No mention of available tools
   agent = Agent(
       name="processor",
       instructions="You help process text.",
       tools=[process_data]
   )

   # Good: Explicitly guide tool usage
   agent = Agent(
       name="processor",
       instructions="You help process text. When users request email "
                    "extraction, use your email extraction tool. "
                    "Always use tools rather than generating example data.",
       tools=[process_data]
   )

3. **Model Too Weak for Tool Reasoning**

GPT-4o-mini occasionally struggles with complex tool selection. Upgrade to GPT-4o for better tool usage.


Issue: "Async Code Deadlocks or Hangs"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Async execution freezes without error.

**Causes & Solutions:**

1. **Mixing Sync and Async Incorrectly**

.. code-block:: python

   # Bad: Calling async function without await
   async def broken():
       result = runner.run_async(agent, input)  # Missing await!
       return result.output

   # Good: Proper await
   async def correct():
       result = await runner.run_async(agent, input)
       return result.output

2. **Blocking I/O in Async Context**

.. code-block:: python

   # Bad: Synchronous I/O blocks event loop
   @tool
   async def bad_tool(url: str) -> str:
       import requests  # Synchronous library
       response = requests.get(url)  # Blocks!
       return response.text

   # Good: Use async I/O library
   @tool
   async def good_tool(url: str) -> str:
       import aiohttp
       async with aiohttp.ClientSession() as session:
           async with session.get(url) as response:
               return await response.text()

3. **Running Async from Sync Context Incorrectly**

.. code-block:: python

   # Bad: Creates new event loop while one exists
   def broken_caller():
       result = asyncio.run(some_async_function())  # May conflict with existing loop

   # Good: Use asyncio.create_task or asyncio.gather
   async def correct_caller():
       result = await some_async_function()


Issue: "Handoff Not Working as Expected"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Agent doesn't hand off to specialist when expected.

**Solution:** Ensure handoff list populated and instructions mention when to hand off:

.. code-block:: python

   triage = Agent(
       name="triage",
       instructions="You route customer requests to specialists. "
                    "For technical problems, hand off to tech_support. "
                    "For billing issues, hand off to billing_support. "
                    "Explicitly state when you're handing off.",
       model="gpt-4o",
       handoffs=[tech_support, billing_support]  # Must include targets
   )


Issue: "Structured Outputs Not Validating"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptom:** Pydantic validation errors or incorrect data types.

**Solution:** Provide clear field descriptions and examples in agent instructions:

.. code-block:: python

   from pydantic import BaseModel, Field

   class Analysis(BaseModel):
       sentiment: str = Field(description="Must be exactly: positive, negative, or neutral")
       confidence: float = Field(ge=0.0, le=1.0, description="Confidence score 0.0-1.0")
       key_phrases: list[str] = Field(description="List of 3-5 key phrases from text")

   agent = Agent(
       name="analyzer",
       instructions="""You analyze text sentiment and extract key phrases.

       CRITICAL: Output must follow this exact format:
       - sentiment: Must be exactly one of: positive, negative, neutral
       - confidence: Float between 0.0 and 1.0
       - key_phrases: List of 3-5 important phrases from the text

       Example:
       {
           "sentiment": "positive",
           "confidence": 0.85,
           "key_phrases": ["excellent service", "highly recommend", "great experience"]
       }
       """,
       model="gpt-4o",
       response_format=Analysis
   )


Issue: "High API Costs"
~~~~~~~~~~~~~~~~~~~~~~~~

**Solutions:**

1. **Use GPT-4o-mini for Simple Tasks**

.. code-block:: python

   # Route by complexity
   def get_appropriate_agent(task_complexity: str) -> Agent:
       if task_complexity == "simple":
           return Agent(name="simple", instructions="...", model="gpt-4o-mini")
       else:
           return Agent(name="complex", instructions="...", model="gpt-4o")

2. **Cache Repetitive Queries**

.. code-block:: python

   from functools import lru_cache

   @lru_cache(maxsize=1000)
   def cached_agent_run(agent_name: str, input_hash: str) -> str:
       """Cache agent responses for identical inputs."""
       result = runner.run(agent=agents[agent_name], input=unhash(input_hash))
       return result.output

3. **Implement Token Limits**

.. code-block:: python

   agent = Agent(
       name="limited",
       instructions="You provide concise responses. Maximum 100 words.",
       model="gpt-4o-mini",
       max_tokens=150  # Hard limit on output
   )

**Lesson to Remember:** Most issues trace to unclear tool descriptions, improper async usage, or cost management oversights. Explicit instructions, proper async patterns, and proactive monitoring prevent majority of production problems.


Related Projects Using This Framework
--------------------------------------

**Hands-On Implementations:**

- **SDR Agent (Sales Automation)** - Week 2 Project: Multi-agent system for prospecting, email generation, and outreach with SendGrid integration
- **Deep Research Agent (Web Search)** - Week 2 Project: Planner-researcher-synthesizer architecture for comprehensive topic investigation

**Next Steps:**

- **CrewAI Framework** - Week 3: Configuration-driven multi-agent teams
- **LangGraph Framework** - Week 4: Computational graphs for complex workflows


Conclusion: Power Through Simplicity
-------------------------------------

OpenAI Agents SDK presents a thesis: frameworks serve best when invisible. Four classes—Agent, Runner, Trace, Result—comprise the entire API surface. No hidden abstractions, no surprise behaviors, no cognitive overhead beyond problem-solving itself.

This minimalism proves deceptive. Sophisticated multi-agent systems emerge from combining simple primitives. Hierarchical architectures arise naturally from agents-as-tools. Complex routing materializes through handoffs. Parallel execution flows from Python's asyncio integration. Production features—tracing, error handling, context sharing—arrive built-in.

The SDK's un-opinionated philosophy carries profound implications. Engineers design architectures matching problem structures rather than contorting problems to fit framework patterns. Experimentation accelerates when setup disappears and iteration dominates workflow. Production deployments integrate cleanly into existing services without framework lock-in.

Yet simplicity demands responsibility. Where CrewAI guides through configuration, Agents SDK trusts engineers to design. Where LangGraph provides graph visualization, Agents SDK expects mental models. Where comprehensive frameworks offer extensive integrations, Agents SDK supplies primitives for custom construction.

The choice crystallizes: embrace explicit simplicity and design freedom, or adopt opinionated structure and guided patterns. Neither proves universally superior—context determines appropriateness.

For rapid prototyping, OpenAI integration, and production systems valuing flexibility, OpenAI Agents SDK delivers. For teams preferring configuration over code, or applications demanding extensive ecosystem integrations, alternatives may serve better.

The foundation now stands complete. Week 1 revealed agent mechanics through direct API orchestration. Week 2 introduced the SDK's elegant abstraction layer. Projects await—SDR automation, deep research systems—demonstrating principles in production contexts.

The agentic journey continues, each framework adding perspectives and capabilities. OpenAI Agents SDK establishes the baseline: understand these primitives, and all subsequent frameworks become variations on fundamental themes.

Simple tools in capable hands build remarkable systems.


Resources & Further Learning
-----------------------------

**Official Documentation:**

- OpenAI Agents SDK Docs: https://platform.openai.com/docs/agents
- GitHub Repository (Course Code): https://github.com/ed-donner/agents/tree/main/week-2-openai
- OpenAI API Reference: https://platform.openai.com/docs/api-reference

**Related Course Materials:**

- Week 1 Foundations: Direct LLM orchestration patterns
- SDR Agent Project: Sales automation implementation
- Deep Research Project: Multi-agent research system

**External Resources:**

- Python Asyncio Documentation: https://docs.python.org/3/library/asyncio.html
- Pydantic Documentation: https://docs.pydantic.dev/
- UV Package Manager: https://github.com/astral-sh/uv


---

*This framework guide provides foundation for Week 2 projects. Proceed to SDR Agent or Deep Research implementations for hands-on application of these concepts in production-grade systems.*

