---
layout: post
title: "(Project) Browser Sidekick: LangGraph Operator Pattern for Web Automation"
date: 2025-11-22 00:00:00 +0530
categories: [ai, agents, projects, langgraph]
tags: [agentic-ai, langgraph, playwright, browser-automation, operator-pattern, state-graphs]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build an autonomous browser automation agent using LangGraph's operator pattern with Playwright integration, demonstrating human-in-the-loop control, checkpointing, and stateful graph execution for complex web tasks."
image:
  path: /attachments/posts/2025-11-22-project-browser-sidekick-langgraph-operator/images/preview_art.png
  alt: "Browser Sidekick Agent"
allow_edit: true
---


Browser Sidekick: LangGraph Operator Pattern for Web Automation
================================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 4 Project | **Framework:** `LangGraph </posts/langgraph-framework-computational-graphs>`_


Preface: Autonomous Web Navigation
-----------------------------------

Web automation traditionally follows rigid scripts—click element A, fill field B, submit form C. Effective for stable sites but brittle when layouts change, content varies, or interactions require judgment. Humans navigate flexibly: adapt to page changes, recognize relevant content, make contextual decisions.

Can AI agents achieve similar flexibility?

Browser Sidekick demonstrates autonomous web navigation through LangGraph's operator pattern—agents perceive page state, reason about actions, execute browser commands, adapt to outcomes. Not scripted automation but genuine autonomy: agent determines actions based on goals and observations.

The architecture reveals LangGraph's computational graph capabilities: state tracking (browser context, task progress), conditional routing (success/retry/human escalation), checkpointing (resume interrupted tasks), human-in-the-loop (approval gates for sensitive actions). Playwright integration provides browser control—navigation, element interaction, screenshot capture.

Beyond toy demonstration, this enables practical web automation: form filling, data extraction, testing workflows, competitive monitoring—anywhere systematic web interaction creates value. The operator pattern provides safety through human oversight: agent suggests actions, human approves before execution, supervision gates prevent unintended consequences.


.. code-block:: mermaid

   stateDiagram-v2
       [*] --> ObservePage
       ObservePage --> ReasonAction: Analyze DOM
       ReasonAction --> HumanApproval: Suggest Action
       HumanApproval --> ExecuteAction: Approved
       HumanApproval --> ReasonAction: Rejected
       ExecuteAction --> CheckOutcome: Perform Action
       CheckOutcome --> ObservePage: Continue
       CheckOutcome --> [*]: Goal Achieved
       CheckOutcome --> HumanEscalation: Stuck/Error


Project Overview
----------------

**What You'll Build:**

Browser automation agent that:
- Navigates websites autonomously
- Perceives page content through DOM analysis
- Reasons about next actions toward goals
- Executes browser commands (click, type, navigate)
- Implements human-in-the-loop approval
- Checkpoints state for resumable execution
- Handles errors gracefully

**Learning Objectives:**

- LangGraph state graphs and conditional routing
- Operator pattern for human-AI collaboration
- Playwright browser automation
- Checkpointing and state persistence
- Tool calling for browser control
- Multi-modal observation (screenshots + DOM)


Architecture
------------

**State Graph:**

.. code-block:: mermaid

   graph TB
       Start[Start: Goal & URL] --> Init[Initialize Browser]
       Init --> Observe[Observe Node:<br/>Screenshot + DOM]
       Observe --> Reason[Reason Node:<br/>Plan Next Action]
       Reason --> Approve{Human Approval?}
       Approve -->|Yes| Execute[Execute Node:<br/>Browser Action]
       Approve -->|No| Reason
       Execute --> Check{Goal Achieved?}
       Check -->|No| Observe
       Check -->|Yes| Success[Success: Return Result]
       Execute --> Error{Error?}
       Error -->|Yes| Escalate[Human Escalation]
       Error -->|Retry| Observe


Implementation Guide
--------------------

**Step 1: Setup Dependencies**

.. code-block:: bash

   # Create project
   mkdir browser-sidekick && cd browser-sidekick

   # Install dependencies
   uv init
   uv add langgraph langchain langchain-openai playwright

   # Install Playwright browsers
   playwright install chromium


**Step 2: State Definition**

.. code-block:: python

   from typing import TypedDict, Annotated, Sequence
   from langchain_core.messages import BaseMessage
   import operator

   class BrowserState(TypedDict):
       """State for browser automation graph."""

       goal: str  # Task objective
       url: str  # Current URL
       messages: Annotated[Sequence[BaseMessage], operator.add]
       page_content: str  # Simplified DOM
       screenshot_path: str  # Screenshot file
       actions_taken: list[dict]  # Action history
       max_steps: int  # Step limit
       step_count: int  # Current step
       status: str  # "in_progress" | "completed" | "error"
       result: str  # Final outcome


**Step 3: Browser Tools**

.. code-block:: python

   from playwright.async_api import async_playwright, Page
   from langchain_core.tools import tool

   # Global browser context
   browser_context = {"page": None, "browser": None}

   @tool
   async def navigate_to_url(url: str) -> str:
       """Navigate browser to URL.

       Args:
           url: Target URL

       Returns:
           Status message
       """
       page: Page = browser_context["page"]
       await page.goto(url)
       return f"Navigated to {url}"

   @tool
   async def click_element(selector: str) -> str:
       """Click element matching CSS selector.

       Args:
           selector: CSS selector

       Returns:
           Status message
       """
       page: Page = browser_context["page"]
       try:
           await page.click(selector, timeout=5000)
           return f"Clicked element: {selector}"
       except Exception as e:
           return f"Failed to click {selector}: {str(e)}"

   @tool
   async def type_text(selector: str, text: str) -> str:
       """Type text into input field.

       Args:
           selector: CSS selector for input
           text: Text to type

       Returns:
           Status message
       """
       page: Page = browser_context["page"]
       try:
           await page.fill(selector, text)
           return f"Typed '{text}' into {selector}"
       except Exception as e:
           return f"Failed to type into {selector}: {str(e)}"

   @tool
   async def extract_text(selector: str) -> str:
       """Extract text from element.

       Args:
           selector: CSS selector

       Returns:
           Extracted text
       """
       page: Page = browser_context["page"]
       try:
           text = await page.text_content(selector)
           return text or "(empty)"
       except Exception as e:
           return f"Failed to extract from {selector}: {str(e)}"

   browser_tools = [
       navigate_to_url,
       click_element,
       type_text,
       extract_text
   ]


**Step 4: Graph Nodes**

.. code-block:: python

   from langchain_openai import ChatOpenAI
   from langchain_core.messages import HumanMessage, SystemMessage

   # Initialize LLM with tools
   llm = ChatOpenAI(model="gpt-4o", temperature=0)
   llm_with_tools = llm.bind_tools(browser_tools)

   async def observe_page(state: BrowserState) -> dict:
       """Observe current page state.

       Args:
           state: Current graph state

       Returns:
           Updated state with observations
       """
       page: Page = browser_context["page"]

       # Capture screenshot
       screenshot_path = f"screenshots/step_{state['step_count']}.png"
       await page.screenshot(path=screenshot_path)

       # Get simplified DOM
       page_content = await page.evaluate("""
           () => {
               const body = document.body;
               return body.innerText.substring(0, 2000);  // First 2K chars
           }
       """)

       current_url = page.url

       return {
           "url": current_url,
           "page_content": page_content,
           "screenshot_path": screenshot_path,
           "step_count": state["step_count"] + 1
       }

   async def reason_action(state: BrowserState) -> dict:
       """Reason about next action.

       Args:
           state: Current graph state

       Returns:
           Updated state with proposed action
       """
       system_prompt = """You are a browser automation agent.

       Analyze the current page and determine the next action to achieve the goal.
       Use available tools: navigate_to_url, click_element, type_text, extract_text.

       If goal is achieved, respond with "GOAL_ACHIEVED".
       If stuck, respond with "NEED_HELP"."""

       messages = [
           SystemMessage(content=system_prompt),
           HumanMessage(content=f"""
Goal: {state['goal']}
Current URL: {state['url']}
Page Content: {state['page_content'][:1000]}
Actions Taken: {len(state['actions_taken'])}

What action should I take next?
           """)
       ]

       response = await llm_with_tools.ainvoke(messages)

       return {
           "messages": [response]
       }

   async def execute_action(state: BrowserState) -> dict:
       """Execute proposed action.

       Args:
           state: Current graph state

       Returns:
           Updated state with action result
       """
       last_message = state["messages"][-1]

       if not last_message.tool_calls:
           return {
               "status": "completed",
               "result": "No more actions needed"
           }

       # Execute tool calls
       results = []
       for tool_call in last_message.tool_calls:
           tool_name = tool_call["name"]
           tool_args = tool_call["args"]

           # Find and execute tool
           tool = next(t for t in browser_tools if t.name == tool_name)
           result = await tool.ainvoke(tool_args)
           results.append(result)

           # Record action
           state["actions_taken"].append({
               "step": state["step_count"],
               "tool": tool_name,
               "args": tool_args,
               "result": result
           })

       return {
           "actions_taken": state["actions_taken"]
       }

   def check_completion(state: BrowserState) -> str:
       """Determine next node based on state.

       Args:
           state: Current graph state

       Returns:
           Next node name
       """
       # Check step limit
       if state["step_count"] >= state["max_steps"]:
           return "escalate"

       # Check goal achievement
       last_message = state["messages"][-1]
       if "GOAL_ACHIEVED" in str(last_message.content):
           return "success"

       # Check for help needed
       if "NEED_HELP" in str(last_message.content):
           return "escalate"

       # Continue observing
       return "observe"


**Step 5: Build Graph**

.. code-block:: python

   from langgraph.graph import StateGraph, END
   from langgraph.checkpoint.memory import MemorySaver

   def create_browser_graph():
       """Create browser automation graph."""

       # Initialize graph
       workflow = StateGraph(BrowserState)

       # Add nodes
       workflow.add_node("observe", observe_page)
       workflow.add_node("reason", reason_action)
       workflow.add_node("execute", execute_action)

       # Add edges
       workflow.set_entry_point("observe")
       workflow.add_edge("observe", "reason")
       workflow.add_edge("reason", "execute")
       workflow.add_conditional_edges(
           "execute",
           check_completion,
           {
               "observe": "observe",
               "success": END,
               "escalate": END
           }
       )

       # Compile with checkpointing
       checkpointer = MemorySaver()
       app = workflow.compile(checkpointer=checkpointer)

       return app


**Step 6: Execute with Operator Pattern**

.. code-block:: python

   async def run_browser_task(goal: str, start_url: str):
       """Run browser automation task with human-in-the-loop.

       Args:
           goal: Task objective
           start_url: Starting URL
       """
       # Initialize browser
       async with async_playwright() as p:
           browser = await p.chromium.launch(headless=False)
           page = await browser.new_page()
           browser_context["browser"] = browser
           browser_context["page"] = page

           # Initialize state
           initial_state = {
               "goal": goal,
               "url": start_url,
               "messages": [],
               "page_content": "",
               "screenshot_path": "",
               "actions_taken": [],
               "max_steps": 15,
               "step_count": 0,
               "status": "in_progress",
               "result": ""
           }

           # Create graph
           app = create_browser_graph()

           # Run with operator pattern
           config = {"configurable": {"thread_id": "browser_session_1"}}

           async for event in app.astream(initial_state, config):
               print(f"\n{'='*60}")
               print(f"Event: {event}")
               print(f"{'='*60}\n")

               # Human approval gate
               if "execute" in event:
                   last_message = event["execute"]["messages"][-1]
                   if last_message.tool_calls:
                       print("\nProposed Action:")
                       for tool_call in last_message.tool_calls:
                           print(f"  {tool_call['name']}: {tool_call['args']}")

                       approval = input("\nApprove? (y/n): ")
                       if approval.lower() != 'y':
                           print("Action rejected by operator.")
                           break

               # Check completion
               if event.get("status") == "completed":
                   print(f"\n✓ Task completed: {event.get('result')}")
                   break

           await browser.close()


**Step 7: Gradio Interface**

.. code-block:: python

   import gradio as gr
   import asyncio

   def browser_task_interface(goal: str, url: str):
       """Gradio interface for browser tasks."""
       asyncio.run(run_browser_task(goal, url))
       return "Task execution complete. Check logs."

   interface = gr.Interface(
       fn=browser_task_interface,
       inputs=[
           gr.Textbox(label="Goal", placeholder="Extract product prices from Amazon"),
           gr.Textbox(label="Starting URL", placeholder="https://amazon.com")
       ],
       outputs=gr.Textbox(label="Result"),
       title="🌐 Browser Sidekick",
       description="Autonomous web automation with human-in-the-loop control."
   )

   interface.launch()


Commercial Applications
-----------------------

**Web Scraping:** Adaptive data extraction from dynamic sites

**Form Automation:** Systematic form filling across platforms

**Testing:** Automated UI testing with adaptive selectors

**Competitive Intelligence:** Monitoring competitor sites

**Lead Generation:** Extracting contact information systematically


Enhancements
------------

**Add Vision Capabilities:**

.. code-block:: python

   from langchain_openai import ChatOpenAI

   # Use GPT-4 Vision for screenshot analysis
   vision_llm = ChatOpenAI(model="gpt-4-vision-preview")

   async def analyze_screenshot(screenshot_path: str) -> str:
       """Analyze screenshot with vision model."""
       with open(screenshot_path, "rb") as img:
           response = await vision_llm.ainvoke([
               {"type": "text", "text": "Describe this webpage"},
               {"type": "image_url", "image_url": img}
           ])
       return response.content


**Lesson to Remember:**

Browser Sidekick demonstrates LangGraph's operator pattern—human-AI collaboration through approval gates and state checkpointing. State graphs enable complex workflows with conditional routing. Checkpointing provides resumability. Human-in-the-loop ensures control over autonomous actions.

The pattern generalizes beyond browser automation: any autonomous system requiring human oversight (trading algorithms, content moderation, data deletion) benefits from operator pattern—AI proposes, human approves, system executes safely.

**Resources:**

- GitHub: https://github.com/ed-donner/agents/tree/main/week-4-langgraph/browser-sidekick
- LangGraph Docs: https://langchain-ai.github.io/langgraph
- Playwright Docs: https://playwright.dev

---

*Use responsibly: respect robots.txt, rate limits, and website terms of service.*

