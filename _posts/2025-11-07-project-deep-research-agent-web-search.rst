---
layout: post
title: "(Project) Deep Research Agent: Multi-Source Web Investigation"
date: 2025-11-19 00:00:00 +0530
categories: [ai, agents, projects, openai]
tags: [agentic-ai, research-agent, web-search, serper, structured-outputs, async-orchestration]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build an autonomous research agent that plans queries, executes parallel web searches, synthesizes findings, and generates comprehensive reports using OpenAI Agents SDK and async Python."
image:
  path: /attachments/posts/2025-11-19-project-deep-research-agent-web-search/images/preview_art.png
  alt: "Deep Research Agent"
allow_edit: true
---


Deep Research Agent: Multi-Source Web Investigation
====================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 2 Project | **Framework:** `OpenAI Agents SDK </posts/openai-agents-sdk-framework>`_


Preface: Research at Machine Speed
-----------------------------------

Comprehensive research demands investigating multiple sources, synthesizing diverse perspectives, identifying patterns across information. Humans excel at synthesis but struggle with scale—reading dozens of sources thoroughly consumes hours. AI excels at processing volume but needs guidance on what to investigate and how to synthesize.

The Deep Research Agent combines both: AI planning determines investigation strategy, AI execution scales across sources, AI synthesis produces coherent analysis. A classic agentic use case—prominent in Claude, ChatGPT, Perplexity—now accessible through custom implementation revealing underlying patterns.

This project demonstrates: planner agents (decompose queries into searches), worker agents (execute searches in parallel), synthesizer agents (combine findings into reports), structured outputs (consistent data formats), async orchestration (concurrent execution), tool integration (Serper web search API).

The result provides genuine utility: market research, competitive analysis, technical investigation, academic literature review—anywhere comprehensive multi-source research drives decisions. Deploy as internal research tool, integrate into applications requiring current information, or enhance with specialized sources for domain expertise.


.. code-block:: mermaid

   graph LR
       Query[Research Query] --> Planner[Planner Agent]
       Planner --> Searches[Search Plan: 3-5 Queries]
       Searches --> W1[Worker 1: Search & Extract]
       Searches --> W2[Worker 2: Search & Extract]
       Searches --> W3[Worker 3: Search & Extract]
       W1 --> Results1[Source 1 Findings]
       W2 --> Results2[Source 2 Findings]
       W3 --> Results3[Source 3 Findings]
       Results1 --> Synthesizer[Synthesizer Agent]
       Results2 --> Synthesizer
       Results3 --> Synthesizer
       Synthesizer --> Report[Comprehensive Report]


Project Overview
----------------

**Learning Objectives:**
- Structured outputs with Pydantic for consistent data
- Async orchestration for parallel agent execution
- Web search tool integration (Serper API)
- Multi-agent workflows: planner → workers → synthesizer
- HTML report generation and email delivery

**Architecture:**

Three-phase workflow:
1. **Planning:** Agent decomposes topic into specific search queries
2. **Research:** Multiple agents execute searches concurrently
3. **Synthesis:** Agent combines findings into coherent report


Implementation Summary
----------------------

**Core Components:**

.. code-block:: python

   from pydantic import BaseModel
   from openai_agents import Agent, Runner
   import asyncio

   # Structured outputs
   class SearchPlan(BaseModel):
       queries: list[str]  # 3-5 search queries
       rationale: str

   class SearchResult(BaseModel):
       query: str
       key_findings: list[str]
       sources: list[str]

   # Planner Agent
   planner_agent = Agent(
       name="research_planner",
       instructions="Decompose research topics into 3-5 specific search queries.",
       model="gpt-4o",
       response_format=SearchPlan
   )

   # Worker Agent Template
   researcher_agent = Agent(
       name="researcher",
       instructions="Execute web search and extract key findings.",
       model="gpt-4o-mini",
       tools=[serper_search_tool]
   )

   # Synthesizer Agent
   synthesizer_agent = Agent(
       name="synthesizer",
       instructions="Combine research findings into comprehensive report.",
       model="gpt-4o"
   )


**Serper Search Tool:**

.. code-block:: python

   import requests
   import os

   def serper_search_tool(query: str, num_results: int = 5) -> dict:
       """Search web using Serper API.

       Args:
           query: Search query
           num_results: Number of results to return

       Returns:
           Search results with titles, snippets, URLs
       """
       response = requests.post(
           "https://google.serper.dev/search",
           headers={
               "X-API-KEY": os.getenv("SERPER_API_KEY"),
               "Content-Type": "application/json"
           },
           json={"q": query, "num": num_results}
       )

       return response.json()


**Async Research Pipeline:**

.. code-block:: python

   async def execute_research(topic: str) -> str:
       """Execute complete research workflow.

       Args:
           topic: Research topic

       Returns:
           HTML report
       """
       runner = Runner()

       # Phase 1: Plan searches
       plan_result = await runner.run_async(
           agent=planner_agent,
           input=f"Plan research queries for: {topic}"
       )
       search_plan: SearchPlan = plan_result.output_structured

       # Phase 2: Execute searches in parallel
       search_tasks = [
           runner.run_async(
               agent=researcher_agent,
               input=f"Research: {query}"
           )
           for query in search_plan.queries
       ]
       search_results = await asyncio.gather(*search_tasks)

       # Phase 3: Synthesize findings
       combined_findings = "\n\n".join([
           f"Query: {result.output_structured.query}\n"
           f"Findings: {result.output_structured.key_findings}"
           for result in search_results
       ])

       synthesis_result = await runner.run_async(
           agent=synthesizer_agent,
           input=f"Synthesize research on '{topic}':\n\n{combined_findings}"
       )

       return synthesis_result.output


**Gradio Interface:**

.. code-block:: python

   import gradio as gr

   async def research_interface(topic: str):
       """Gradio interface for research agent."""
       report = await execute_research(topic)
       return report

   interface = gr.Interface(
       fn=research_interface,
       inputs=gr.Textbox(label="Research Topic"),
       outputs=gr.HTML(label="Research Report"),
       title="Deep Research Agent"
   )

   interface.launch()


Commercial Applications
-----------------------

**Market Research:** Competitive landscape analysis, trend identification

**Due Diligence:** Investment research, partner evaluation

**Technical Investigation:** Technology comparison, architecture patterns

**Content Creation:** Background research for articles, reports


Key Implementation Details
---------------------------

**Rate Limiting:**

.. code-block:: python

   # Serper API: 2500/month free, then $50/1000
   # Limit concurrent searches
   semaphore = asyncio.Semaphore(3)  # Max 3 concurrent

   async def search_with_limit(query):
       async with semaphore:
           return await runner.run_async(agent=researcher, input=query)


**Quality Enhancement:**

- Use GPT-4o for planner and synthesizer (better quality)
- Use GPT-4o-mini for search execution (cost optimization)
- Implement evaluation loop for report quality
- Add citation tracking for source attribution


**Lesson to Remember:**

Deep Research Agent demonstrates planner-executor-synthesizer pattern—ubiquitous in agentic systems requiring investigation. Planning decomposes problems, parallel execution scales work, synthesis produces coherence. This architecture generalizes: code analysis (plan modules, analyze each, synthesize architecture), data processing (plan queries, process batches, aggregate results), content generation (plan sections, draft each, combine into document).

**Resources:**

- GitHub: https://github.com/ed-donner/agents/tree/main/week-2-openai/deep-research
- Serper API: https://serper.dev
- Related: Stock Picker (Week 3), Trading Floor (Week 6)

