---
layout: post
title: "(Agentic AI Framework) Autogen: Conversational Agent Collaboration"
date: 2025-11-15 00:00:00 +0530
categories: [ai, agents, autogen]
tags: [agentic-ai, autogen, microsoft, multi-agent-conversation, code-execution, agent-debate]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Master Microsoft's Autogen framework for building conversational multi-agent systems with code execution, debate patterns, and remote agent collaboration for complex problem-solving."
image:
  path: /attachments/posts/2025-11-15-autogen-framework-agent-collaboration/images/preview_art.png
  alt: "Autogen Framework Overview"
allow_edit: true
---


Autogen: Conversational Agent Collaboration
============================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 5 | **Previous:** `LangGraph </posts/langgraph-framework-computational-graphs>`_


Preface: Conversation as Computation
-------------------------------------

Multi-agent systems face a fundamental question: how should agents communicate? Previous frameworks answer variously—through orchestrators routing outputs, through tools enabling function calls, through graphs channeling state transitions. Each approach models communication differently, prioritizing different capabilities.

Microsoft's Autogen presents an alternative thesis: conversation itself as the fundamental medium.

Where other frameworks treat inter-agent communication as implementation detail, Autogen elevates it to primary abstraction. Agents engage in structured dialogues—proposing ideas, critiquing suggestions, refining solutions through debate. The framework provides conversation patterns as primitives: two-agent interactions, group chats, sequential discussions, debate protocols.

This conversation-centric philosophy manifests practically. Building a coding assistant? Create UserProxy agent representing humans, AssistantAgent providing suggestions, conversation emerges naturally. Need multi-perspective analysis? Instantiate specialist agents, let them debate until consensus. Require code generation and execution? ConversableAgent writes code, Executor agent runs it safely, iterating until success.

The framework's origins in Microsoft Research show through sophisticated features: code execution sandboxes, nested agent conversations, teachability (agents learning from corrections), human-in-loop patterns, and perhaps most uniquely—agents that create other agents (meta-agent capabilities).

Yet sophistication brings complexity. Autogen demands understanding conversation patterns, managing message flows, configuring agent roles carefully. The framework assumes practitioners comfortable with debate patterns, consensus mechanisms, and conversation-driven problem-solving—perhaps more natural for researchers than engineers accustomed to deterministic workflows.

This document explores Autogen systematically—from foundational conversation patterns through practical multi-agent implementations, from code execution capabilities to meta-agent creation. The journey reveals when conversation-centric architectures provide elegant solutions versus when simpler orchestration patterns suffice.


.. code-block:: mermaid

   mindmap
     root((Autogen))
       Core Concepts
         Conversable Agents
         User Proxies
         Assistant Agents
         Group Chat
       Conversation Patterns
         Two Agent Chat
         Sequential Chat
         Group Discussion
         Nested Conversations
       Code Execution
         Local Execution
         Docker Sandbox
         Code Validation
         Iterative Refinement
       Advanced Features
         Teachability
         Human in Loop
         Agent Creation
         Tool Integration


Framework Philosophy: Conversation-Driven Agents
-------------------------------------------------

Autogen's design reflects research insights about multi-agent problem-solving.


Why Conversation Matters
~~~~~~~~~~~~~~~~~~~~~~~~~

Human problem-solving leverages dialogue: proposing solutions, receiving feedback, refining approaches through discussion. Autogen applies this pattern to agent systems.

**Traditional Orchestration:**

.. code-block:: python

   # Sequential processing
   research_output = research_agent.run(query)
   analysis_output = analysis_agent.run(research_output)
   final_report = writer_agent.run(analysis_output)

**Conversational Approach:**

.. code-block:: python

   # Dialogue-based problem-solving
   user_proxy = UserProxyAgent(name="user")
   assistant = AssistantAgent(name="assistant")

   # Agents converse until problem solved
   user_proxy.initiate_chat(
       assistant,
       message="Help me analyze this dataset and create visualizations."
   )
   # Assistant proposes code, user proxy executes, provides feedback, iterates

The conversation enables iterative refinement through natural feedback loops.


Agent Types in Autogen
~~~~~~~~~~~~~~~~~~~~~~~

**ConversableAgent:** Base class supporting conversation

**UserProxyAgent:** Represents human users, executes code, provides feedback

**AssistantAgent:** Provides AI-powered assistance (wraps LLMs)

**GroupChatManager:** Coordinates multi-agent discussions

Each type serves specific conversation roles, combined to create interaction patterns.


When Autogen Excels
~~~~~~~~~~~~~~~~~~~~

**Optimal Scenarios:**

- **Code Generation and Execution:** Iterative development with validation
- **Multi-Perspective Analysis:** Agents debate solutions
- **Research Applications:** Exploratory problem-solving
- **Human-AI Collaboration:** Natural dialogue patterns
- **Consensus Building:** Multiple agents reaching agreement

**Consider Alternatives When:**

- **Deterministic Workflows:** OpenAI Agents SDK simpler for fixed patterns
- **Production Scale:** Simpler frameworks may offer better performance
- **Team Unfamiliarity:** Conversation patterns steeper learning curve than configuration (CrewAI)

**Lesson to Remember:** Autogen treats conversation as first-class abstraction, enabling natural problem-solving through dialogue. This approach excels when iteration through feedback proves more effective than predefined workflows, when multiple perspectives require synthesis through debate, or when code generation needs validation through execution.


Core Concepts: Agents and Conversations
----------------------------------------

Two primitives define Autogen: conversable agents and conversation patterns.


Conversable Agents
~~~~~~~~~~~~~~~~~~

All Autogen agents inherit from `ConversableAgent`, enabling participation in conversations.

**Basic Agent Creation:**

.. code-block:: python

   from autogen import ConversableAgent

   agent = ConversableAgent(
       name="assistant",
       system_message="You are a helpful AI assistant.",
       llm_config={"model": "gpt-4o", "temperature": 0.7},
       human_input_mode="NEVER",  # Don't ask for human input
       max_consecutive_auto_reply=10  # Limit turns
   )

**Key Parameters:**

- **name**: Agent identifier in conversations
- **system_message**: Defines agent's role and behavior
- **llm_config**: Model configuration (model, temperature, API key)
- **human_input_mode**: When to request human input ("ALWAYS", "NEVER", "TERMINATE")
- **max_consecutive_auto_reply**: Prevents infinite loops


UserProxyAgent: Human Representative
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Represents human users, typically executes code and provides feedback.

.. code-block:: python

   from autogen import UserProxyAgent

   user_proxy = UserProxyAgent(
       name="user_proxy",
       human_input_mode="TERMINATE",  # Ask for input when chat should end
       max_consecutive_auto_reply=10,
       is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
       code_execution_config={
           "work_dir": "coding",
           "use_docker": False  # Set True for sandboxed execution
       }
   )

**Code Execution Config:**

- **work_dir**: Directory for generated code and outputs
- **use_docker**: Whether to execute code in Docker container (recommended for production)
- **timeout**: Maximum execution time for code
- **last_n_messages**: How many messages to consider for execution


AssistantAgent: LLM-Powered Helper
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

AI assistant that generates responses, proposes solutions, writes code.

.. code-block:: python

   from autogen import AssistantAgent

   assistant = AssistantAgent(
       name="coding_assistant",
       system_message="""You are a helpful AI assistant skilled in Python.
       When asked to solve problems, write clear, well-documented code.
       Always end your response with TERMINATE when the task is complete.""",
       llm_config={
           "model": "gpt-4o",
           "temperature": 0,
           "config_list": [{
               "model": "gpt-4o",
               "api_key": os.getenv("OPENAI_API_KEY")
           }]
       }
   )


Two-Agent Conversations
~~~~~~~~~~~~~~~~~~~~~~~~

The simplest pattern: two agents conversing.

.. code-block:: python

   from autogen import UserProxyAgent, AssistantAgent

   # Create agents
   user = UserProxyAgent(
       name="user",
       human_input_mode="NEVER",
       code_execution_config={"work_dir": "output"}
   )

   assistant = AssistantAgent(
       name="assistant",
       system_message="You help solve problems. End with TERMINATE when done.",
       llm_config={"model": "gpt-4o"}
   )

   # Initiate conversation
   user.initiate_chat(
       assistant,
       message="Calculate the first 10 Fibonacci numbers and save to file."
   )

**Conversation Flow:**

1. User sends initial message
2. Assistant responds (potentially with code)
3. User executes code if present, reports results
4. Assistant refines based on results
5. Iteration continues until termination message

**Lesson to Remember:** Autogen's conversational abstraction enables natural iteration through feedback. Agents propose solutions, receive validation (through code execution or critique), refine approaches—mirroring human problem-solving. This pattern particularly shines for code generation where execution feedback guides refinement.


Group Chats: Multi-Agent Discussions
-------------------------------------

When problems benefit from multiple perspectives, group chats enable collaborative problem-solving.


Creating Group Chats
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   from autogen import ConversableAgent, GroupChat, GroupChatManager

   # Define specialist agents
   researcher = ConversableAgent(
       name="researcher",
       system_message="You research topics thoroughly using available sources.",
       llm_config={"model": "gpt-4o"}
   )

   analyst = ConversableAgent(
       name="analyst",
       system_message="You analyze data and identify patterns.",
       llm_config={"model": "gpt-4o"}
   )

   critic = ConversableAgent(
       name="critic",
       system_message="You critically evaluate proposals and identify flaws.",
       llm_config={"model": "gpt-4o"}
   )

   # Create group chat
   group_chat = GroupChat(
       agents=[researcher, analyst, critic],
       messages=[],
       max_round=10  # Maximum conversation rounds
   )

   # Create manager to coordinate
   manager = GroupChatManager(
       groupchat=group_chat,
       llm_config={"model": "gpt-4o"}
   )

   # Initiate discussion
   researcher.initiate_chat(
       manager,
       message="Analyze the impact of AI agents on software development."
   )


How Group Chats Work
~~~~~~~~~~~~~~~~~~~~~

1. **Message Broadcast:** One agent speaks, all agents receive message
2. **Speaker Selection:** Manager selects next speaker based on conversation state
3. **Turn-Taking:** Selected agent responds
4. **Iteration:** Continues until max rounds or termination

**Speaker Selection Strategies:**

- **auto**: Manager LLM decides based on conversation
- **round_robin**: Each agent speaks in order
- **random**: Random selection
- **manual**: Human selects next speaker


Debate Pattern Implementation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Multi-agent debates for decision-making:

.. code-block:: python

   # Define debaters
   proposer = AssistantAgent(
       name="proposer",
       system_message="You argue FOR the motion. Be persuasive.",
       llm_config={"model": "gpt-4o"}
   )

   opposer = AssistantAgent(
       name="opposer",
       system_message="You argue AGAINST the motion. Find weaknesses.",
       llm_config={"model": "gpt-4o"}
   )

   judge = AssistantAgent(
       name="judge",
       system_message="You judge the debate and declare a winner with reasoning.",
       llm_config={"model": "gpt-4o"}
   )

   # Create debate
   debate = GroupChat(
       agents=[proposer, opposer, judge],
       messages=[],
       max_round=6,  # 2 rounds per agent
       speaker_selection_method="round_robin"
   )

   manager = GroupChatManager(groupchat=debate, llm_config={"model": "gpt-4o"})

   # Start debate
   proposer.initiate_chat(
       manager,
       message="Motion: AI agents will replace most software developers by 2030."
   )


Sequential Chats
~~~~~~~~~~~~~~~~

Chain multiple conversations:

.. code-block:: python

   from autogen import initiate_chats

   # Define chat sequence
   chats = [
       {
           "sender": user_proxy,
           "recipient": researcher,
           "message": "Research topic X",
           "summary_method": "last_msg"
       },
       {
           "sender": user_proxy,
           "recipient": analyst,
           "message": "Analyze the research",
           "summary_method": "reflection_with_llm",
           "carryover": True  # Include previous chat summary
       },
       {
           "sender": user_proxy,
           "recipient": writer,
           "message": "Write report based on analysis",
           "carryover": True
       }
   ]

   # Execute sequence
   results = initiate_chats(chats)

Each chat receives summary of previous conversations via `carryover`.

**Lesson to Remember:** Group chats enable collaborative problem-solving through structured discussions. Multiple agents contribute perspectives, managed by coordinator selecting speakers. Debate patterns leverage disagreement productively. Sequential chats chain conversations, passing context forward. These patterns mirror human collaborative processes: brainstorming, debate, consensus-building.


Code Execution and Validation
------------------------------

Autogen's killer feature: safe code execution with iterative refinement.


Local Code Execution
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   from autogen import UserProxyAgent, AssistantAgent

   user_proxy = UserProxyAgent(
       name="executor",
       code_execution_config={
           "work_dir": "generated_code",
           "use_docker": False,  # Local execution
           "timeout": 60,
           "last_n_messages": 3
       }
   )

   coder = AssistantAgent(
       name="coder",
       system_message="You write Python code to solve problems.",
       llm_config={"model": "gpt-4o"}
   )

   user_proxy.initiate_chat(
       coder,
       message="Create a function to calculate pi using Monte Carlo method. Run it."
   )

**Execution Flow:**

1. Coder generates Python code in response
2. User proxy detects code block, extracts code
3. User proxy executes code locally
4. User proxy sends execution results back to coder
5. Coder refines code if errors occurred
6. Iteration continues until success


Docker Sandbox Execution
~~~~~~~~~~~~~~~~~~~~~~~~~

Production systems should execute untrusted code in containers:

.. code-block:: python

   user_proxy = UserProxyAgent(
       name="executor",
       code_execution_config={
           "work_dir": "generated_code",
           "use_docker": True,  # Execute in Docker
           "timeout": 60,
           "docker_image": "python:3.11-slim"  # Specify image
       }
   )

Requires Docker installed and daemon running.


Iterative Code Refinement Example
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Request with potential for errors
   user_proxy.initiate_chat(
       coder,
       message="""
       Create a web scraper that:
       1. Fetches https://example.com
       2. Extracts all links
       3. Saves to JSON file
       4. Handles errors gracefully

       Run the code to verify it works.
       """
   )

**Typical Conversation:**

.. code-block:: text

   Coder: Here's the code... [generates initial version]

   Executor: Error: ModuleNotFoundError: No module named 'requests'

   Coder: I'll fix that by importing urllib instead... [revised code]

   Executor: Error: Invalid URL handling

   Coder: Updated error handling... [further revision]

   Executor: Successfully scraped 15 links, saved to links.json

   Coder: TERMINATE

Conversation continues until code executes successfully.


Tool Integration
~~~~~~~~~~~~~~~~

Agents can use tools beyond code execution:

.. code-block:: python

   from autogen import register_function

   def search_web(query: str) -> str:
       """Search the web for information."""
       # Implementation
       return results

   # Register tool with agents
   register_function(
       search_web,
       caller=assistant,
       executor=user_proxy,
       description="Search web for current information"
   )

   # Assistant can now call search_web, user_proxy executes it

**Lesson to Remember:** Code execution with validation enables iterative development. Agents propose code, execution provides immediate feedback, agents refine based on errors. This cycle mirrors test-driven development but with AI generating both code and tests. Docker sandboxing ensures safety. Tool registration extends capabilities beyond code to web search, API calls, database queries.


Advanced Patterns: Meta-Agents and Teachability
------------------------------------------------

Autogen's research heritage shows in sophisticated capabilities.


Agents Creating Agents
~~~~~~~~~~~~~~~~~~~~~~~

Meta-agent pattern: agents that design and instantiate other agents.

.. code-block:: python

   from autogen import ConversableAgent, AssistantAgent

   # Creator agent
   creator = AssistantAgent(
       name="agent_creator",
       system_message="""You design and create specialized agents.
       When asked to create an agent, provide Python code that instantiates
       an AssistantAgent or UserProxyAgent with appropriate configuration.""",
       llm_config={"model": "gpt-4o"}
   )

   # Executor to run agent creation code
   executor = UserProxyAgent(
       name="executor",
       code_execution_config={"work_dir": "agents"}
   )

   # Request agent creation
   executor.initiate_chat(
       creator,
       message="""Create a financial analyst agent with:
       - Expertise in stock market analysis
       - Access to financial data tools
       - Conservative risk assessment perspective"""
   )

Creator generates code instantiating new agent with specified characteristics.


Teachability: Learning from Corrections
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Agents can learn from human corrections:

.. code-block:: python

   from autogen.agentchat.contrib.teachable_agent import TeachableAgent

   teachable_assistant = TeachableAgent(
       name="teachable",
       llm_config={"model": "gpt-4o"},
       teach_config={
           "verbosity": 1,
           "reset_db": False,  # Persist learnings
           "path_to_db_dir": "./learning_db"
       }
   )

   # Conversation with corrections
   user.send(
       "What's the capital of California?",
       teachable_assistant
   )
   # Agent: "Los Angeles"

   user.send(
       "Actually, the capital is Sacramento, not Los Angeles. Remember that.",
       teachable_assistant
   )
   # Agent learns and stores correction

Future conversations recall corrections, improving accuracy over time.


Nested Conversations
~~~~~~~~~~~~~~~~~~~~

Agents can initiate sub-conversations to solve subtasks:

.. code-block:: python

   def research_subtask(topic: str) -> str:
       """Spawn sub-conversation for research."""
       sub_researcher = AssistantAgent(name="sub_researcher", ...)
       sub_executor = UserProxyAgent(name="sub_exec", ...)

       sub_executor.initiate_chat(
           sub_researcher,
           message=f"Research {topic}"
       )

       return sub_executor.last_message()["content"]

   # Main agent uses nested conversations
   register_function(
       research_subtask,
       caller=main_assistant,
       executor=user_proxy
   )

Enables hierarchical problem decomposition.


Human-in-Loop Patterns
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Agent requests human input at critical decisions
   decision_maker = UserProxyAgent(
       name="decision_maker",
       human_input_mode="ALWAYS",  # Always ask human
       is_termination_msg=lambda x: False  # Never auto-terminate
   )

   assistant.initiate_chat(
       decision_maker,
       message="Should we proceed with this risky operation?"
   )
   # Execution pauses, awaits human input

**Lesson to Remember:** Advanced patterns—meta-agents, teachability, nested conversations, human-in-loop—reflect Autogen's research origins. These capabilities enable sophisticated applications: agents creating specialized agents for tasks, learning from corrections to improve over time, decomposing complex problems into sub-conversations, pausing for human judgment. Such patterns distinguish Autogen from simpler production-focused frameworks.


Related Projects Using Autogen
-------------------------------

**Hands-On Implementations:**

- **Agent Creator** - Week 5 Project: Meta-agent system that designs and launches specialized agents for dynamic task solving

**Framework Comparisons:**

- **OpenAI Agents SDK** - Week 2: Simple orchestration primitives
- **CrewAI** - Week 3: Configuration-driven teams
- **LangGraph** - Week 4: Graph-based state management
- **MCP** - Week 6: Open protocol for agent collaboration


Conclusion: Conversation as Architecture
-----------------------------------------

Autogen demonstrates that conversation itself can serve as architectural foundation for multi-agent systems. Where other frameworks model communication as implementation detail, Autogen elevates it to design primitive. This inversion enables natural patterns: iterative code refinement through execution feedback, multi-perspective analysis through debate, consensus building through group discussion.

The framework's sophistication reflects Microsoft Research origins. Features like teachability, nested conversations, and meta-agent creation showcase capabilities valuable in research contexts but potentially overwhelming in production environments. The conversation-centric approach proves most natural for exploratory problem-solving, code generation with validation, and scenarios benefiting from multiple perspectives debating toward consensus.

Yet this sophistication carries costs. Conversation patterns require careful design to avoid endless debates or circular discussions. Managing message flows across multiple agents demands attention. The framework assumes comfort with debate protocols and consensus mechanisms perhaps more natural to researchers than production engineers.

Autogen occupies unique space in the framework landscape: more sophisticated than configuration-driven CrewAI, more conversation-focused than graph-based LangGraph, more research-oriented than production-optimized OpenAI Agents SDK. The framework serves practitioners exploring conversational problem-solving patterns, building systems requiring iterative code refinement, or researching multi-agent collaboration mechanisms.

The code execution capabilities particularly shine—enabling AI-generated code to run safely, provide feedback, iterate toward working solutions. This pattern has driven adoption in code generation applications, data analysis workflows, and exploratory programming contexts.

Autogen proves that conversation need not be mere metaphor but can serve as genuine architectural principle. When problems benefit from dialogue-based iteration, when multiple perspectives require synthesis, when code generation needs validation through execution—conversational architectures provide elegant solutions.

Not every problem requires conversation-driven solutions. But when dialogue enables progress that orchestration cannot—Autogen provides the medium.


Resources & Further Learning
-----------------------------

**Official Documentation:**

- Autogen Documentation: https://microsoft.github.io/autogen/
- GitHub Repository: https://github.com/microsoft/autogen
- Course Code: https://github.com/ed-donner/agents/tree/main/week-5-autogen

**Related Materials:**

- Code Execution in Docker
- Multi-Agent Debate Patterns
- Agent Creator Project

---

*This framework guide establishes foundation for Week 5 projects. Proceed to Agent Creator implementation for hands-on application of Autogen's meta-agent capabilities in dynamic agent creation systems.*

