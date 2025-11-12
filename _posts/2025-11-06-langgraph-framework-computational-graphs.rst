---
layout: post
title: "(Agentic AI Framework) LangGraph: Computational Graphs for Stateful Workflows"
date: 2025-11-14 00:00:00 +0530
categories: [ai, agents, langgraph]
tags: [agentic-ai, langgraph, state-machines, computational-graphs, stateful-workflows, langchain]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Master LangGraph's graph-based approach to building stateful, cyclic agent workflows with explicit state management, conditional routing, and persistent execution for complex multi-agent systems."
image:
  path: /attachments/posts/2025-11-14-langgraph-framework-computational-graphs/images/preview_art.png
  alt: "LangGraph Framework Overview"
allow_edit: true
---


LangGraph: Computational Graphs for Stateful Workflows
=======================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 4 | **Previous:** `CrewAI </posts/crewai-framework-multi-agent-teams>`_


Preface: When Simple Patterns Prove Insufficient
-------------------------------------------------

Sequential workflows serve many needs. Agent A completes task, passes results to Agent B, who passes to Agent C, culminating in final output. Clean, predictable, sufficient.

Until it isn't.

Some problems resist linear decomposition. Research workflows where initial findings determine subsequent investigation paths. Customer support scenarios where conversation branches based on user responses. Trading systems where market conditions trigger different analysis sequences. Debugging workflows where each attempt informs the next diagnostic step.

These scenarios share characteristics: cycles (loops back to earlier steps), conditions (branching based on state), persistence (resuming after interruption), explicit state management (tracking what happened and why). Linear orchestration patterns—sequential task chains, even hierarchical coordination—struggle with such complexity.

LangGraph addresses this through computational graph abstractions.

Where CrewAI provides task sequences and OpenAI Agents SDK offers orchestration primitives, LangGraph models workflows as explicit graphs: nodes (processing steps), edges (transitions), state (shared data), conditions (routing logic). Workflows become state machines visualizable as diagrams, debuggable as graphs, persistent as checkpoints.

The power manifests immediately: complex branching, explicit loops, state inspection, resumable execution. The cost emerges gradually: steeper learning curve, more verbose code, framework-specific abstractions requiring mastery before productivity.

LangGraph occupies the "sophisticated" tier of agent frameworks. Not because sophistication implies superiority—different problems reward different tools—but because the framework exposes complexity rather than hiding it. Graph construction, state management, checkpoint systems all demand explicit handling. The framework trusts engineers to manage this complexity in exchange for precise control.

This document explores LangGraph systematically—from foundational graph concepts through practical stateful workflows, from simple chains to complex multi-agent systems. The journey reveals when graph-based architectures justify their complexity through capabilities impossible in simpler frameworks.


.. code-block:: mermaid

   mindmap
     root((LangGraph))
       Core Concepts
         Nodes
         Edges
         State
         Checkpoints
       Node Types
         Agent Nodes
         Tool Nodes
         Function Nodes
         Conditional Nodes
       Edge Types
         Normal Edges
         Conditional Edges
         Entry Points
         End Nodes
       State Management
         State Schema
         State Updates
         State History
         Persistence
       Advanced Features
         Subgraphs
         Human-in-Loop
         Parallel Execution
         Error Handling


Framework Philosophy: Graphs as First-Class Citizens
-----------------------------------------------------

LangGraph's design emerges from recognizing limitations in linear agent orchestration.


Why Graphs Matter
~~~~~~~~~~~~~~~~~

Traditional frameworks model workflows implicitly through code execution order. LangGraph makes workflows explicit through graph structures.

**Linear Workflow (OpenAI Agents SDK):**

.. code-block:: python

   # Implicit workflow through code sequence
   result1 = await runner.run_async(research_agent, input)
   result2 = await runner.run_async(analysis_agent, result1.output)
   result3 = await runner.run_async(writer_agent, result2.output)

**Graph Workflow (LangGraph):**

.. code-block:: python

   # Explicit workflow as graph
   from langgraph.graph import StateGraph, END

   workflow = StateGraph(AgentState)
   workflow.add_node("research", research_node)
   workflow.add_node("analyze", analyze_node)
   workflow.add_node("write", write_node)

   workflow.add_edge("research", "analyze")
   workflow.add_edge("analyze", "write")
   workflow.add_edge("write", END)

   workflow.set_entry_point("research")

The graph representation enables:

- **Visualization:** Workflows render as diagrams
- **Inspection:** State transitions become observable
- **Modification:** Add nodes/edges without code rewrites
- **Cycles:** Loop back to previous nodes naturally
- **Conditions:** Route based on state dynamically


Stateful by Design
~~~~~~~~~~~~~~~~~~

Previous frameworks treat state implicitly (context parameters) or ignore it entirely (stateless agents). LangGraph makes state central through explicit schemas.

.. code-block:: python

   from typing import TypedDict, Annotated
   from langgraph.graph import add_messages

   class AgentState(TypedDict):
       """State schema for agent workflow."""
       messages: Annotated[list, add_messages]  # Conversation history
       next_step: str  # Routing decision
       research_complete: bool  # Progress tracking
       data: dict  # Accumulated results
       retries: int  # Error handling

Every node receives state, potentially modifies it, returns updated state. State flows through graph, accumulating information, enabling cycles and conditions.


When LangGraph Excels
~~~~~~~~~~~~~~~~~~~~~~

**Optimal Scenarios:**

- **Complex Branching:** Workflow paths determined by runtime state
- **Stateful Workflows:** Need to track progress, accumulate data
- **Human-in-Loop:** Require pauses for human approval/input
- **Debugging Complex Systems:** Benefit from state inspection and graph visualization
- **Cyclic Workflows:** Naturally loop based on conditions
- **Production Persistence:** Resume interrupted workflows from checkpoints

**Consider Alternatives When:**

- **Simple Linear Workflows:** OpenAI Agents SDK or CrewAI simpler
- **Rapid Prototyping:** Setup overhead may slow initial development
- **Team Inexperience:** Steeper learning curve than alternatives

**Lesson to Remember:** LangGraph trades simplicity for explicitness and power. Where simpler frameworks hide workflow complexity in execution order, LangGraph exposes it through graph structures and state management. This exposure enables sophisticated capabilities—cycles, conditions, persistence, inspection—at the cost of additional code and concepts to master.


Core Concepts: Nodes, Edges, and State
---------------------------------------

Three primitives define LangGraph's architecture.


Nodes: Processing Units
~~~~~~~~~~~~~~~~~~~~~~~~

Nodes represent processing steps in the workflow—functions that receive state, perform operations, return updated state.

**Node Function Signature:**

.. code-block:: python

   from typing import TypedDict

   class AgentState(TypedDict):
       messages: list
       data: dict

   def my_node(state: AgentState) -> AgentState:
       """Process state and return updates."""
       # Access current state
       current_messages = state["messages"]
       current_data = state["data"]

       # Perform operations
       result = process_something(current_messages)

       # Return state updates (partial or complete)
       return {
           "messages": current_messages + [result],
           "data": {**current_data, "new_key": "new_value"}
       }

**Node Types:**

**1. Agent Nodes (LLM Calls):**

.. code-block:: python

   from langchain_openai import ChatOpenAI
   from langchain_core.messages import HumanMessage

   def researcher_node(state: AgentState) -> AgentState:
       """Research agent node."""
       llm = ChatOpenAI(model="gpt-4o")

       response = llm.invoke([
           {"role": "system", "content": "You are a researcher."},
           *state["messages"]
       ])

       return {"messages": [response]}

**2. Tool Nodes (External Actions):**

.. code-block:: python

   def web_search_node(state: AgentState) -> AgentState:
       """Execute web search."""
       query = state["search_query"]
       results = search_api.search(query)

       return {
           "search_results": results,
           "messages": [f"Found {len(results)} results"]
       }

**3. Logic Nodes (State Manipulation):**

.. code-block:: python

   def routing_logic_node(state: AgentState) -> AgentState:
       """Determine next step based on state."""
       if state["retries"] > 3:
           return {"next_step": "escalate"}
       elif state["confidence"] > 0.8:
           return {"next_step": "complete"}
       else:
           return {"next_step": "retry"}


Edges: Transitions
~~~~~~~~~~~~~~~~~~~

Edges define allowed transitions between nodes.

**Normal Edges (Always Execute):**

.. code-block:: python

   from langgraph.graph import StateGraph, END

   workflow = StateGraph(AgentState)
   workflow.add_node("step1", step1_node)
   workflow.add_node("step2", step2_node)

   workflow.add_edge("step1", "step2")  # Always go step1 → step2
   workflow.add_edge("step2", END)      # Always end after step2

**Conditional Edges (Dynamic Routing):**

.. code-block:: python

   def route_condition(state: AgentState) -> str:
       """Determine next node based on state."""
       if state["needs_research"]:
           return "research"
       elif state["needs_analysis"]:
           return "analyze"
       else:
           return "complete"

   workflow.add_conditional_edges(
       "router",  # Source node
       route_condition,  # Function returning next node name
       {
           "research": "research_node",
           "analyze": "analysis_node",
           "complete": END
       }
   )

**Entry Points:**

.. code-block:: python

   workflow.set_entry_point("initial_node")  # Where execution begins

**End Points:**

.. code-block:: python

   from langgraph.graph import END

   workflow.add_edge("final_node", END)  # Terminates execution


State: Shared Data Structure
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

State flows through the graph, nodes read and update it.

**State Schema Definition:**

.. code-block:: python

   from typing import TypedDict, Annotated, Sequence
   from langchain_core.messages import BaseMessage
   from langgraph.graph import add_messages

   class ResearchState(TypedDict):
       """State for research workflow."""
       # Messages with special handling (append, don't replace)
       messages: Annotated[Sequence[BaseMessage], add_messages]

       # Standard fields (last write wins)
       topic: str
       research_complete: bool
       sources: list[str]
       summary: str
       confidence: float
       retry_count: int

**State Update Semantics:**

- **Replacement (default):** New value replaces old
- **Annotated (custom):** `add_messages` appends to list instead of replacing

.. code-block:: python

   # State before node
   state = {
       "messages": ["Message 1"],
       "retry_count": 0
   }

   # Node returns partial update
   return {
       "messages": ["Message 2"],  # Appends due to add_messages annotation
       "retry_count": 1  # Replaces old value
   }

   # State after node
   state = {
       "messages": ["Message 1", "Message 2"],  # Appended
       "retry_count": 1  # Replaced
   }

**Accessing State in Nodes:**

.. code-block:: python

   def my_node(state: ResearchState) -> dict:
       # Read state
       current_topic = state["topic"]
       message_count = len(state["messages"])

       # Update specific fields
       return {
           "research_complete": True,
           "confidence": 0.95
       }  # Only returns changed fields

**Lesson to Remember:** Nodes process state, edges route between nodes, state accumulates information. This architecture enables cycles (edges point backward), conditions (edges chosen dynamically), and persistence (state snapshots). The explicit graph structure makes complex workflows tractable by separating concerns: nodes define processing, edges define flow, state defines data.


Installation and Basic Setup
-----------------------------

LangGraph integrates with the broader LangChain ecosystem.


Prerequisites
~~~~~~~~~~~~~

- Python 3.10+ (3.11+ recommended)
- LangChain familiarity helpful but not required
- API keys for LLM providers


Installation
~~~~~~~~~~~~

.. code-block:: bash

   # Core LangGraph
   pip install langgraph

   # LangChain integrations
   pip install langchain langchain-openai langchain-anthropic

   # Optional: LangSmith for tracing
   pip install langsmith


API Configuration
~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # .env
   OPENAI_API_KEY=sk-proj-xxxxx
   ANTHROPIC_API_KEY=sk-ant-xxxxx

   # Optional: LangSmith tracing
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=ls__xxxxx
   LANGCHAIN_PROJECT=my-project


Simple Graph Example
~~~~~~~~~~~~~~~~~~~~~

**Complete "Hello World" Graph:**

.. code-block:: python

   from typing import TypedDict
   from langgraph.graph import StateGraph, END
   from langchain_openai import ChatOpenAI

   # Define state
   class ConversationState(TypedDict):
       messages: list
       user_name: str

   # Define nodes
   def greet_node(state: ConversationState) -> dict:
       """Generate greeting."""
       llm = ChatOpenAI(model="gpt-4o-mini")

       response = llm.invoke([
           {"role": "user", "content": f"Greet {state['user_name']} warmly"}
       ])

       return {"messages": [response.content]}

   def farewell_node(state: ConversationState) -> dict:
       """Generate farewell."""
       llm = ChatOpenAI(model="gpt-4o-mini")

       response = llm.invoke([
           {"role": "user", "content": f"Say goodbye to {state['user_name']}"}
       ])

       return {"messages": state["messages"] + [response.content]}

   # Build graph
   workflow = StateGraph(ConversationState)
   workflow.add_node("greet", greet_node)
   workflow.add_node("farewell", farewell_node)

   workflow.add_edge("greet", "farewell")
   workflow.add_edge("farewell", END)
   workflow.set_entry_point("greet")

   # Compile
   app = workflow.compile()

   # Execute
   initial_state = {"messages": [], "user_name": "Alice"}
   result = app.invoke(initial_state)

   print(result["messages"])

**Output:**

.. code-block:: text

   ['Hello Alice! Welcome!', 'Goodbye Alice, have a great day!']


Visualizing Graphs
~~~~~~~~~~~~~~~~~~~

LangGraph can render graphs as diagrams:

.. code-block:: python

   from IPython.display import Image, display

   # Generate graph visualization
   display(Image(app.get_graph().draw_mermaid_png()))

Produces Mermaid diagram showing nodes and edges—invaluable for debugging complex workflows.

**Lesson to Remember:** LangGraph's core loop: define state schema, create nodes (functions receiving/returning state), connect nodes with edges, compile into executable application. The compilation step optimizes the graph and prepares for execution. Visualization capabilities provide immediate feedback on workflow structure.


Conditional Routing and Cycles
-------------------------------

Where simple frameworks struggle, LangGraph excels: complex branching and loops.


Conditional Routing Pattern
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Route dynamically based on state:

.. code-block:: python

   from typing import Literal
   from langgraph.graph import StateGraph, END

   class DebugState(TypedDict):
       problem: str
       attempts: int
       solution_found: bool
       max_attempts: int

   def diagnose_node(state: DebugState) -> dict:
       """Attempt diagnosis."""
       # Diagnostic logic here
       solution_found = run_diagnostic(state["problem"])

       return {
           "attempts": state["attempts"] + 1,
           "solution_found": solution_found
       }

   def route_after_diagnosis(state: DebugState) -> Literal["retry", "escalate", "complete"]:
       """Decide next step."""
       if state["solution_found"]:
           return "complete"
       elif state["attempts"] >= state["max_attempts"]:
           return "escalate"
       else:
           return "retry"

   # Build graph
   workflow = StateGraph(DebugState)
   workflow.add_node("diagnose", diagnose_node)
   workflow.add_node("escalate", escalate_node)
   workflow.add_node("complete", complete_node)

   # Conditional routing from diagnose
   workflow.add_conditional_edges(
       "diagnose",
       route_after_diagnosis,
       {
           "retry": "diagnose",  # Loop back!
           "escalate": "escalate",
           "complete": "complete"
       }
   )

   workflow.add_edge("escalate", END)
   workflow.add_edge("complete", END)
   workflow.set_entry_point("diagnose")

The `"retry": "diagnose"` edge creates a cycle—diagnostic node can invoke itself repeatedly until solution found or max attempts reached.


Cyclic Workflows for Iterative Refinement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   class WritingState(TypedDict):
       draft: str
       feedback: str
       iteration: int
       quality_score: float
       target_score: float

   def write_node(state: WritingState) -> dict:
       """Generate or revise draft."""
       llm = ChatOpenAI(model="gpt-4o")

       if state["iteration"] == 0:
           prompt = "Write an essay about AI."
       else:
           prompt = f"Revise this essay:\n{state['draft']}\n\nFeedback:\n{state['feedback']}"

       response = llm.invoke([{"role": "user", "content": prompt}])

       return {
           "draft": response.content,
           "iteration": state["iteration"] + 1
       }

   def evaluate_node(state: WritingState) -> dict:
       """Evaluate draft quality."""
       llm = ChatOpenAI(model="gpt-4o-mini")

       response = llm.invoke([
           {"role": "user", "content": f"Rate this essay 0-10 and provide feedback:\n{state['draft']}"}
       ])

       # Parse response for score and feedback
       score = extract_score(response.content)
       feedback = extract_feedback(response.content)

       return {
           "quality_score": score,
           "feedback": feedback
       }

   def should_revise(state: WritingState) -> Literal["revise", "done"]:
       """Decide if revision needed."""
       if state["quality_score"] >= state["target_score"]:
           return "done"
       elif state["iteration"] >= 5:
           return "done"  # Max iterations
       else:
           return "revise"

   # Build graph with cycle
   workflow = StateGraph(WritingState)
   workflow.add_node("write", write_node)
   workflow.add_node("evaluate", evaluate_node)

   workflow.set_entry_point("write")
   workflow.add_edge("write", "evaluate")
   workflow.add_conditional_edges(
       "evaluate",
       should_revise,
       {
           "revise": "write",  # Cycle back to write node
           "done": END
       }
   )

This implements evaluator-optimizer pattern from Week 1, but with explicit loop support.


Multi-Agent Collaboration Graph
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   def researcher_node(state: State) -> dict:
       """Research agent."""
       llm = ChatOpenAI(model="gpt-4o")
       response = llm.invoke([...])
       return {"research_done": True, "research_data": response.content}

   def analyst_node(state: State) -> dict:
       """Analyst agent."""
       llm = ChatOpenAI(model="claude-3-5-sonnet-20241022")
       response = llm.invoke([...])
       return {"analysis_done": True, "analysis": response.content}

   def synthesizer_node(state: State) -> dict:
       """Synthesis agent."""
       llm = ChatOpenAI(model="gpt-4o")
       response = llm.invoke([...])
       return {"final_report": response.content}

   def coordinator_node(state: State) -> Literal["research", "analyze", "synthesize"]:
       """Route to next agent."""
       if not state.get("research_done"):
           return "research"
       elif not state.get("analysis_done"):
           return "analyze"
       else:
           return "synthesize"

   workflow = StateGraph(State)
   workflow.add_node("coordinator", coordinator_node)
   workflow.add_node("researcher", researcher_node)
   workflow.add_node("analyst", analyst_node)
   workflow.add_node("synthesizer", synthesizer_node)

   workflow.set_entry_point("coordinator")
   workflow.add_conditional_edges("coordinator", coordinator_node, {...})
   workflow.add_edge("researcher", "coordinator")  # Return to coordinator
   workflow.add_edge("analyst", "coordinator")     # Return to coordinator
   workflow.add_edge("synthesizer", END)

Coordinator orchestrates specialists, receiving control back after each completes their task.

**Lesson to Remember:** Conditional edges and cycles transform linear workflows into adaptive systems. Routing functions inspect state and return node names, enabling dynamic branching. Cycles (edges pointing to earlier nodes) enable iteration, refinement, and adaptive problem-solving. These capabilities distinguish LangGraph from simpler orchestration frameworks.


Checkpoints and Persistence
----------------------------

Production systems require resumability—continuing interrupted workflows without starting over.


Checkpoint System
~~~~~~~~~~~~~~~~~

LangGraph automatically checkpoints state after each node execution:

.. code-block:: python

   from langgraph.checkpoint.sqlite import SqliteSaver

   # Configure checkpoint storage
   memory = SqliteSaver.from_conn_string(":memory:")  # In-memory (testing)
   # or
   memory = SqliteSaver.from_conn_string("checkpoints.db")  # Persistent

   # Compile with checkpointer
   app = workflow.compile(checkpointer=memory)

   # Execute with thread_id for persistence
   config = {"configurable": {"thread_id": "conversation-123"}}
   result = app.invoke(initial_state, config=config)

Every node execution creates checkpoint. If execution fails or pauses, resume from last checkpoint.


Resuming Interrupted Workflows
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Initial execution
   config = {"configurable": {"thread_id": "debug-session-42"}}

   try:
       result = app.invoke(initial_state, config=config)
   except Exception as e:
       print(f"Workflow interrupted: {e}")

   # Resume later (potentially different process/machine)
   app_resumed = workflow.compile(checkpointer=memory)
   result = app_resumed.invoke(None, config=config)  # Resumes from checkpoint

State restored from database, execution continues from interruption point.


Human-in-the-Loop Workflows
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Pause execution for human approval/input:

.. code-block:: python

   from langgraph.checkpoint import interrupt

   def approval_node(state: State) -> dict:
       """Pause for human approval."""
       # Checkpoint and interrupt
       interrupt(f"Approve this action: {state['proposed_action']}?")

       # Execution pauses here until resumed
       return {"approved": True}

   # Execute until interrupt
   config = {"configurable": {"thread_id": "session-1"}}
   try:
       app.invoke(initial_state, config=config)
   except Interrupt as e:
       print(f"Awaiting approval: {e.message}")

   # Human reviews, provides approval
   # Resume with updated state
   approval_state = {"approved": True}
   app.invoke(approval_state, config=config)

Enables workflows requiring human judgment at critical decision points.


State History
~~~~~~~~~~~~~

Access complete execution history:

.. code-block:: python

   # Get all checkpoints for thread
   checkpoints = app.get_state_history({"configurable": {"thread_id": "session-1"}})

   for checkpoint in checkpoints:
       print(f"Step: {checkpoint.step}")
       print(f"Node: {checkpoint.node}")
       print(f"State: {checkpoint.state}")
       print("---")

Enables debugging, auditing, and understanding agent decision-making.

**Lesson to Remember:** Checkpoints transform fragile workflows into resilient systems. Automatic state persistence enables resuming after failures, pausing for human input, and replaying execution history. These capabilities prove essential for production deployments where reliability and observability matter.


Related Projects Using LangGraph
---------------------------------

**Hands-On Implementations:**

- **Browser Sidekick (Operator Agent)** - Week 4 Project: Graph-based browser automation agent working alongside users in web environments

**Framework Comparisons:**

- **OpenAI Agents SDK** - Week 2: Lightweight, stateless orchestration
- **CrewAI** - Week 3: Configuration-driven teams
- **Autogen** - Week 5: Conversation-centric collaboration


Conclusion: Graphs When Complexity Demands Structure
-----------------------------------------------------

LangGraph addresses the limitation where linear orchestration patterns fail: complex branching, iterative refinement, stateful execution, resumable workflows. By modeling workflows as explicit computational graphs, the framework provides capabilities impossible in simpler alternatives.

The cost manifests in complexity: steeper learning curves, more verbose code, framework-specific abstractions. State schemas require definition. Nodes require implementation. Edges require explicit connection. Conditional routing requires routing functions. The simplicity of sequential execution disappears behind graph construction ceremony.

Yet this complexity buys capability. Cycles enable iterative refinement until quality thresholds met. Conditional edges route dynamically based on runtime state. Checkpoints enable resuming interrupted workflows. State inspection enables debugging complex agent interactions. Human-in-loop patterns pause for approval. Graph visualization makes workflows comprehensible.

The framework serves practitioners facing problems resistant to simpler approaches. When workflows branch unpredictably based on intermediate results, LangGraph's conditional routing excels. When iterations must continue until success criteria met, cycles provide natural expression. When production systems require resilience, checkpoints deliver resumability.

LangGraph occupies the sophisticated tier deliberately. Not every problem requires this power—many yield to simpler patterns in OpenAI Agents SDK or CrewAI. But when complexity demands structure, when state must be managed explicitly, when workflows must be visualized and debugged—LangGraph provides tools matching the challenge.

The framework reflects a philosophy: expose complexity rather than hide it, provide powerful primitives rather than convenient abstractions, trust engineers to wield sophistication responsibly. This approach rewards those willing to master graph concepts with capabilities unattainable in simpler frameworks.

Computational graphs as first-class citizens enable building agent systems matching problem complexity rather than fighting framework limitations. When simple patterns suffice, simpler frameworks serve better. When complexity arrives, LangGraph stands ready.


Resources & Further Learning
-----------------------------

**Official Documentation:**

- LangGraph Documentation: https://langchain-ai.github.io/langgraph/
- LangChain Documentation: https://python.langchain.com/docs/
- Course Code: https://github.com/ed-donner/agents/tree/main/week-4-langgraph

**Related Materials:**

- LangSmith Tracing: https://smith.langchain.com/
- Graph Visualization Tools
- Browser Sidekick Project

---

*This framework guide establishes foundation for Week 4 projects. Proceed to Browser Sidekick implementation for hands-on application of LangGraph in stateful, interactive agent systems.*

