---
layout: post
title: "(Project) Agent Creator: Meta-Agent System Design with Autogen"
date: 2025-11-23 00:00:00 +0530
categories: [ai, agents, projects, autogen]
tags: [agentic-ai, autogen, meta-agents, code-execution, distributed-agents, agent-generation]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build a meta-agent system that creates other agents dynamically using Autogen's code execution capabilities, distributed runtime, and multi-modal messaging for autonomous agent generation and deployment."
image:
  path: /attachments/posts/2025-11-23-project-agent-creator-meta-agents/images/preview_art.png
  alt: "Agent Creator Meta-Agent System"
allow_edit: true
---


Agent Creator: Meta-Agent System Design with Autogen
=====================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 5 Project | **Framework:** `Autogen </posts/autogen-framework-agent-collaboration>`_


Preface: Agents Creating Agents
--------------------------------

Most agent systems operate with fixed architectures—predefined roles, hardcoded workflows, static capabilities. Effective for known problems but limited when requirements emerge dynamically. What if agents could design and deploy other agents autonomously?

This meta-capability—agents creating agents—represents significant autonomy: systems that adapt architecture to problems rather than forcing problems into fixed architectures. An agent analyzing requirements, determining optimal specialist structure, generating code for those specialists, deploying them as functional team.

The Agent Creator demonstrates this through Autogen's unique capabilities: code execution in Docker (safe agent code generation), distributed runtime (deploy agents remotely), multi-modal messages (agents communicating with images/code), meta-programming patterns (agents reasoning about agent design).

The project reveals when meta-agents provide value: dynamic problem decomposition (unknown specialist mix), rapid prototyping (test agent architectures quickly), scalable agent deployment (generate hundreds of specialists), adaptive systems (reconfigure teams based on performance).

Beyond technical demonstration, this explores AI autonomy's expanding frontier—not just agents solving problems, but agents designing problem-solving systems. The implications span software development (systems that architect themselves), organizational design (teams that restructure dynamically), AI research (agents improving agents).


.. code-block:: mermaid

   graph TB
       User[User Request:<br/>Build Stock Analysis Team] --> Creator[Creator Agent<br/>Meta-Agent]
       Creator --> Analyze[Analyze Requirements]
       Analyze --> Design[Design Agent Architecture]
       Design --> Generate[Generate Agent Code]
       Generate --> E1[Execute Code:<br/>Create Researcher Agent]
       Generate --> E2[Execute Code:<br/>Create Analyst Agent]
       Generate --> E3[Execute Code:<br/>Create Reporter Agent]
       E1 --> D1[Deploy Agent 1]
       E2 --> D2[Deploy Agent 2]
       E3 --> D3[Deploy Agent 3]
       D1 --> Team[Functional Agent Team]
       D2 --> Team
       D3 --> Team
       Team --> Execute[Execute Task]
       Execute --> Result[Return Analysis]


Project Overview
----------------

**What You'll Build:**

Meta-agent system that:
- Accepts natural language task descriptions
- Analyzes requirements and determines optimal agent architecture
- Generates Python code for specialist agents
- Executes code in Docker sandbox
- Deploys agents to distributed runtime
- Coordinates generated agents to complete tasks
- Returns results with generated team composition

**Learning Objectives:**

- Autogen code execution with Docker
- Meta-programming with LLMs
- Distributed agent runtime (Autogen Core)
- Multi-modal messages
- Safe code execution patterns
- Dynamic agent orchestration


Architecture
------------

**Three-Layer System:**

1. **Meta Layer:** Creator agent that designs systems
2. **Generation Layer:** Code execution creating agents
3. **Execution Layer:** Generated agents solving tasks

.. code-block:: mermaid

   sequenceDiagram
       participant U as User
       participant C as Creator Agent
       participant E as Code Executor
       participant A1 as Generated Agent 1
       participant A2 as Generated Agent 2

       U->>C: "Build team for financial analysis"
       C->>C: Analyze requirements
       C->>C: Design 3-agent architecture
       C->>E: Generate researcher agent code
       E->>A1: Deploy researcher agent
       C->>E: Generate analyst agent code
       E->>A2: Deploy analyst agent
       C->>A1: Execute research task
       A1-->>C: Research results
       C->>A2: Execute analysis task
       A2-->>C: Analysis results
       C->>U: Return complete analysis


Implementation Guide
--------------------

**Step 1: Setup Autogen with Docker**

.. code-block:: bash

   # Install Autogen
   uv init agent-creator
   cd agent-creator
   uv add "autogen[docker]" openai

   # Ensure Docker running
   docker --version


**Step 2: Creator Agent with Code Execution**

.. code-block:: python

   from autogen import AssistantAgent, UserProxyAgent
   from autogen.coding import DockerCommandLineCodeExecutor

   # Code executor (Docker sandbox)
   executor = DockerCommandLineCodeExecutor(
       image="python:3.11-slim",
       timeout=60,
       work_dir="agent_workspace"
   )

   # User proxy for code execution
   user_proxy = UserProxyAgent(
       name="user_proxy",
       human_input_mode="NEVER",
       code_execution_config={
           "executor": executor
       }
   )

   # Creator meta-agent
   creator_agent = AssistantAgent(
       name="agent_creator",
       system_message="""You are a meta-agent that creates other agents.

       When given a task:
       1. Analyze what specialist agents are needed
       2. Generate Python code to create those agents using Autogen
       3. Generate code to coordinate those agents
       4. Execute the code to complete the task

       Your generated code should:
       - Import necessary Autogen components
       - Define agent configurations
       - Create agent instances
       - Set up communication patterns
       - Execute the workflow
       - Return results

       Generate complete, executable Python code.""",
       llm_config={
           "model": "gpt-4o",
           "temperature": 0,
           "api_key": os.getenv("OPENAI_API_KEY")
       }
   )


**Step 3: Agent Generation Templates**

.. code-block:: python

   AGENT_TEMPLATE = '''
from autogen import AssistantAgent

{agent_name} = AssistantAgent(
    name="{agent_name}",
    system_message="""{system_message}""",
    llm_config={{
        "model": "gpt-4o-mini",
        "temperature": 0
    }}
)
'''

   WORKFLOW_TEMPLATE = '''
# Agent workflow execution
from autogen import initiate_chats

chat_results = initiate_chats([
    {{
        "sender": user_proxy,
        "recipient": {agent1_name},
        "message": "{agent1_task}"
    }},
    {{
        "sender": user_proxy,
        "recipient": {agent2_name},
        "message": "{agent2_task}",
        "summary_method": "reflection_with_llm"
    }}
])

print(chat_results[-1].summary)
'''


**Step 4: Dynamic Agent Generation**

.. code-block:: python

   def create_agent_system(task_description: str) -> str:
       """Create agent system for task.

       Args:
           task_description: Natural language task

       Returns:
           Execution result
       """
       # Prompt creator to design and generate agents
       prompt = f"""
Create a multi-agent system to complete this task:

{task_description}

Design the optimal agent architecture:
1. Determine specialist agents needed
2. Define each agent's role and capabilities
3. Generate Python code creating these agents
4. Generate coordination code
5. Execute the complete workflow

Generate and run complete Python code that:
- Creates all necessary agents
- Executes the workflow
- Returns the final result
"""

       # Initiate conversation
       result = user_proxy.initiate_chat(
           creator_agent,
           message=prompt
       )

       return result.summary


**Step 5: Example Usage**

.. code-block:: python

   # Example: Financial analysis team
   task = """
   Analyze Tesla (TSLA) stock for investment decision.

   Create a team with:
   - Researcher: Gather company financials and news
   - Analyst: Evaluate investment potential
   - Risk Assessor: Identify risks
   - Reporter: Synthesize into recommendation
   """

   result = create_agent_system(task)
   print(result)


**Step 6: Gradio Interface**

.. code-block:: python

   import gradio as gr

   def generate_and_execute(task_description: str, num_agents: int = 3):
       """Gradio interface for agent creation.

       Args:
           task_description: Task description
           num_agents: Suggested agent count

       Returns:
           Execution result and generated code
       """
       enhanced_task = f"""
{task_description}

Create approximately {num_agents} specialist agents to complete this task.
"""

       result = create_agent_system(enhanced_task)

       return {
           "result": result,
           "agents_created": "Check logs for generated agents"
       }

   interface = gr.Interface(
       fn=generate_and_execute,
       inputs=[
           gr.Textbox(
               label="Task Description",
               lines=5,
               placeholder="Describe the task requiring multiple agents..."
           ),
           gr.Slider(
               minimum=2,
               maximum=10,
               value=3,
               step=1,
               label="Suggested Agent Count"
           )
       ],
       outputs=[
           gr.JSON(label="Results")
       ],
       title="🤖 Agent Creator: Meta-Agent System",
       description="Describe a task and the system will design and deploy specialized agents to complete it.",
       examples=[
           ["Analyze market sentiment for Apple stock from news sources", 3],
           ["Plan a 7-day European vacation with budget optimization", 4],
           ["Debug a Python web application with performance issues", 3]
       ]
   )

   interface.launch()


**Step 7: Safety and Validation**

.. code-block:: python

   def validate_generated_code(code: str) -> tuple[bool, str]:
       """Validate generated agent code for safety.

       Args:
           code: Generated Python code

       Returns:
           (is_safe, reason)
       """
       # Check for dangerous operations
       dangerous_patterns = [
           "import os.system",
           "subprocess.call",
           "eval(",
           "exec(",
           "__import__",
           "open(",  # File operations
       ]

       for pattern in dangerous_patterns:
           if pattern in code:
               return False, f"Dangerous pattern detected: {pattern}"

       # Check for required imports
       if "from autogen import" not in code:
           return False, "Missing Autogen imports"

       return True, "Code validated"

   # Use in creator
   def safe_create_agent_system(task: str) -> str:
       """Create agent system with validation."""
       result = create_agent_system(task)

       # Extract code from result
       # Validate before execution
       is_safe, reason = validate_generated_code(result.code)

       if not is_safe:
           return f"Code validation failed: {reason}"

       return result


Commercial Applications
-----------------------

**Dynamic Workflows:** Systems adapting architecture to problems

**Rapid Prototyping:** Testing agent architectures quickly

**Scalable Deployment:** Generating many specialist agents

**AI Development Tools:** IDE assistants creating agent scaffolds

**Research Platforms:** Exploring agent architecture designs


Autogen Core: Distributed Runtime
----------------------------------

For production deployment, use Autogen Core's distributed capabilities:

.. code-block:: python

   from autogen_core import AgentId, AgentRuntime, MessageContext
   from autogen_core.agents import BaseChatAgent

   # Define distributed agent
   class DistributedAnalystAgent(BaseChatAgent):
       def __init__(self, name: str):
           super().__init__(name)

       async def on_message(self, message: str, ctx: MessageContext):
           # Process message
           result = await self.analyze(message)
           return result

   # Deploy to runtime
   runtime = AgentRuntime()

   # Register agent
   await runtime.register(
       "analyst",
       lambda: DistributedAnalystAgent("analyst")
   )

   # Start runtime
   await runtime.start()


Enhancements
------------

**Add Agent Performance Monitoring:**

.. code-block:: python

   class MonitoredAgent(AssistantAgent):
       """Agent with performance tracking."""

       def __init__(self, *args, **kwargs):
           super().__init__(*args, **kwargs)
           self.metrics = {
               "messages": 0,
               "tokens": 0,
               "errors": 0
           }

       def receive(self, message, sender):
           self.metrics["messages"] += 1
           try:
               result = super().receive(message, sender)
               return result
           except Exception as e:
               self.metrics["errors"] += 1
               raise


**Add Agent Optimization Loop:**

.. code-block:: python

   def optimize_agent_team(task: str, max_iterations: int = 3):
       """Iteratively improve agent architecture.

       Args:
           task: Task description
           max_iterations: Optimization iterations

       Returns:
           Best performing agent configuration
       """
       best_result = None
       best_score = 0

       for i in range(max_iterations):
           # Generate agent system
           result = create_agent_system(task)

           # Evaluate performance
           score = evaluate_result(result)

           if score > best_score:
               best_score = score
               best_result = result

           # Feedback for improvement
           feedback = f"Previous attempt scored {score}. Improve agent design."
           task = f"{task}\n\nOptimization feedback: {feedback}"

       return best_result


Lesson to Remember
------------------

Agent Creator demonstrates meta-programming's power and complexity. Agents can design systems dynamically—analyzing requirements, generating specialists, orchestrating collaboration. This provides genuine flexibility: architectures adapting to problems rather than constraining problems to fixed architectures.

Yet meta-agents introduce challenges: generated code requires validation, orchestration complexity increases, debugging becomes harder (multi-layer systems), costs scale (meta-reasoning expensive).

The pattern suits specific scenarios: truly dynamic requirements where architecture cannot be predetermined, rapid experimentation needing many architectural variations, scalable specialist generation where manual creation impractical.

More broadly, this explores AI autonomy's frontier. Current agents solve tasks. Meta-agents design task-solving systems. Future meta-meta-agents might design agents that design agents—recursive self-improvement limited by validation, safety, alignment challenges.

The key insight: autonomy increases with abstraction level (task execution → system design → meta-design), but so does need for human oversight, validation, safety mechanisms. Balance automation benefits against control requirements.


Resources & Further Learning
-----------------------------

**Project Code:**
- GitHub: https://github.com/ed-donner/agents/tree/main/week-5-autogen/agent-creator

**Related Materials:**
- Autogen Documentation: https://microsoft.github.io/autogen
- Autogen Core (Distributed): https://microsoft.github.io/autogen/stable/user-guide/core-user-guide/
- Docker Code Execution: https://microsoft.github.io/autogen/docs/topics/code-execution

**Related Projects:**
- Engineering Team (Week 3): Multi-agent code generation
- Trading Floor (Week 6): Complex multi-agent system

---

*Generated agents require review. Meta-programming powerful but demands careful validation.*

