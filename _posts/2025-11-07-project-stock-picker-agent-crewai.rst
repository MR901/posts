---
layout: post
title: "(Project) Stock Picker: CrewAI Multi-Agent Investment Analysis"
date: 2025-11-20 00:00:00 +0530
categories: [ai, agents, projects, crewai]
tags: [agentic-ai, crewai, investment-analysis, financial-agents, structured-outputs, hierarchical-process]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build a multi-agent investment analysis system using CrewAI with researcher, analyst, and risk assessor agents collaborating to generate stock recommendations with structured Pydantic outputs."
image:
  path: /attachments/posts/2025-11-20-project-stock-picker-agent-crewai/images/preview_art.png
  alt: "Stock Picker Agent System"
allow_edit: true
---


Stock Picker: CrewAI Multi-Agent Investment Analysis
=====================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 3 Project | **Framework:** `CrewAI </posts/crewai-framework-multi-agent-teams>`_


Preface: Systematic Investment Analysis
----------------------------------------

Investment decisions demand synthesizing diverse information: financial fundamentals, market sentiment, technical indicators, risk factors. Individual analysts develop expertise in specific domains but struggle to master all dimensions simultaneously. Multi-agent systems model investment committees—specialists collaborating toward comprehensive recommendations.

This project demonstrates CrewAI's configuration-driven approach through practical financial application. Three agents collaborate: researcher gathers company data, analyst evaluates fundamentals, risk assessor identifies concerns. YAML configuration defines roles without code verbosity. Structured outputs ensure consistent recommendations. Hierarchical processing enables manager coordination when needed.

The result provides genuine investment workflow—systematically analyzing stocks through specialist lenses, producing actionable recommendations with supporting evidence. Beyond toy demonstration, the pattern applies to real wealth management, robo-advisors, personal finance tools—anywhere systematic analysis drives investment decisions.


.. code-block:: mermaid

   graph TB
       Input[Stock Symbol: AAPL] --> Researcher[Research Agent:<br/>Company Data & News]
       Researcher --> Data[Financial Data<br/>Recent News<br/>Industry Context]
       Data --> Analyst[Analysis Agent:<br/>Fundamental Evaluation]
       Analyst --> Evaluation[Valuation<br/>Growth Prospects<br/>Competitive Position]
       Evaluation --> RiskAssessor[Risk Agent:<br/>Risk Assessment]
       RiskAssessor --> Risks[Market Risks<br/>Company Risks<br/>Valuation Risks]
       Risks --> Output[Structured Recommendation]
       Output --> Report[Buy/Hold/Sell<br/>Target Price<br/>Confidence Score]


Project Overview
----------------

**What You'll Build:**

Investment analysis crew that:
1. Researches company fundamentals and recent news
2. Analyzes financial health and growth prospects
3. Assesses investment risks
4. Generates structured recommendation (Buy/Hold/Sell)
5. Outputs consistent format via Pydantic models

**Learning Objectives:**

- CrewAI YAML configuration for agents and tasks
- Structured outputs with Pydantic in CrewAI
- Custom tools for financial data
- Sequential vs. hierarchical processing
- Agent memory for context retention


Implementation Guide
--------------------

**Step 1: Initialize CrewAI Project**

.. code-block:: bash

   # Create project
   crewai create crew stock_picker
   cd stock_picker

   # Install dependencies
   uv sync


**Step 2: Configure Agents (YAML)**

**src/stock_picker/config/agents.yaml:**

.. code-block:: yaml

   financial_researcher:
     role: "Senior Financial Researcher"
     goal: "Research {company} thoroughly, gathering financial data and recent news"
     backstory: >
       You're a seasoned financial researcher with expertise in fundamental analysis.
       You excel at finding relevant company information, parsing financial statements,
       and identifying key developments that impact investment decisions.
     llm: gpt-4o-mini
     tools:
       - serper_search
     max_iter: 15
     verbose: true

   fundamental_analyst:
     role: "Fundamental Analysis Expert"
     goal: "Analyze {company}'s financial health and investment potential"
     backstory: >
       You're a fundamental analyst with deep expertise in valuation, financial ratios,
       and company analysis. You evaluate business models, competitive advantages,
       and growth prospects to determine fair value.
     llm: gpt-4o
     verbose: true

   risk_assessor:
     role: "Investment Risk Analyst"
     goal: "Identify and assess investment risks for {company}"
     backstory: >
       You specialize in risk assessment, identifying potential pitfalls in investments.
       You consider market risks, company-specific risks, valuation risks, and
       macroeconomic factors that could impact returns.
     llm: gpt-4o-mini
     verbose: true


**Step 3: Define Tasks (YAML)**

**src/stock_picker/config/tasks.yaml:**

.. code-block:: yaml

   research_company:
     description: >
       Research {company} comprehensively:
       - Current stock price and market cap
       - Recent financial results (revenue, profit, margins)
       - Latest news and developments
       - Industry position and competitors
       - Key metrics (P/E ratio, growth rate, etc.)
     expected_output: >
       Detailed research report including financial metrics, recent news,
       and relevant context for investment analysis.
     agent: financial_researcher
     output_file: "output/research.md"

   analyze_fundamentals:
     description: >
       Analyze {company}'s investment potential based on research:
       - Evaluate business model strength
       - Assess competitive advantages
       - Analyze financial health (profitability, cash flow, debt)
       - Determine growth prospects
       - Estimate fair value range
     expected_output: >
       Fundamental analysis report with valuation assessment and
       growth prospects evaluation.
     agent: fundamental_analyst
     context: [research_company]
     output_file: "output/analysis.md"

   assess_risks:
     description: >
       Identify investment risks for {company}:
       - Company-specific risks (competition, execution, regulation)
       - Market risks (valuation, sentiment, sector trends)
       - Macroeconomic risks (interest rates, economic conditions)
       - Risk-reward assessment
     expected_output: >
       Risk assessment report identifying key concerns and
       their potential impact.
     agent: risk_assessor
     context: [research_company, analyze_fundamentals]
     output_file: "output/risks.md"

   generate_recommendation:
     description: >
       Synthesize research, analysis, and risk assessment into
       structured investment recommendation for {company}
     expected_output: >
       Structured recommendation with buy/hold/sell rating,
       target price, confidence score, key strengths, key risks,
       and investment thesis.
     agent: fundamental_analyst
     context: [research_company, analyze_fundamentals, assess_risks]
     output_pydantic: StockRecommendation


**Step 4: Structured Output Model**

**src/stock_picker/models.py:**

.. code-block:: python

   from pydantic import BaseModel, Field

   class StockRecommendation(BaseModel):
       """Structured stock recommendation output."""

       company: str = Field(description="Company name")
       ticker: str = Field(description="Stock ticker symbol")
       recommendation: str = Field(
           description="Investment recommendation: Buy, Hold, or Sell"
       )
       target_price: float = Field(
           description="12-month target price estimate"
       )
       current_price: float = Field(
           description="Current stock price"
       )
       upside_potential: float = Field(
           description="Percentage upside to target (can be negative)"
       )
       confidence: int = Field(
           description="Confidence level 1-10",
           ge=1,
           le=10
       )
       key_strengths: list[str] = Field(
           description="3-5 key investment strengths"
       )
       key_risks: list[str] = Field(
           description="3-5 key investment risks"
       )
       investment_thesis: str = Field(
           description="2-3 sentence investment thesis"
       )


**Step 5: Crew Definition**

**src/stock_picker/crew.py:**

.. code-block:: python

   from crewai import Agent, Crew, Process, Task
   from crewai.project import CrewBase, agent, crew, task
   from crewai_tools import SerperDevTool
   from .models import StockRecommendation

   @CrewBase
   class StockPickerCrew:
       """Stock analysis crew."""

       agents_config = "config/agents.yaml"
       tasks_config = "config/tasks.yaml"

       @agent
       def financial_researcher(self) -> Agent:
           return Agent(
               config=self.agents_config['financial_researcher'],
               tools=[SerperDevTool()]
           )

       @agent
       def fundamental_analyst(self) -> Agent:
           return Agent(
               config=self.agents_config['fundamental_analyst']
           )

       @agent
       def risk_assessor(self) -> Agent:
           return Agent(
               config=self.agents_config['risk_assessor']
           )

       @task
       def research_company(self) -> Task:
           return Task(
               config=self.tasks_config['research_company'],
               agent=self.financial_researcher()
           )

       @task
       def analyze_fundamentals(self) -> Task:
           return Task(
               config=self.tasks_config['analyze_fundamentals'],
               agent=self.fundamental_analyst()
           )

       @task
       def assess_risks(self) -> Task:
           return Task(
               config=self.tasks_config['assess_risks'],
               agent=self.risk_assessor()
           )

       @task
       def generate_recommendation(self) -> Task:
           return Task(
               config=self.tasks_config['generate_recommendation'],
               agent=self.fundamental_analyst(),
               output_pydantic=StockRecommendation
           )

       @crew
       def crew(self) -> Crew:
           return Crew(
               agents=self.agents,
               tasks=self.tasks,
               process=Process.SEQUENTIAL,
               verbose=True
           )


**Step 6: Execution**

**src/stock_picker/main.py:**

.. code-block:: python

   from stock_picker.crew import StockPickerCrew

   def run():
       inputs = {
           'company': 'Tesla',
           'ticker': 'TSLA'
       }

       crew = StockPickerCrew()
       result = crew.crew().kickoff(inputs=inputs)

       # Access structured output
       recommendation: StockRecommendation = result.pydantic

       print(f"\n{'='*60}")
       print(f"INVESTMENT RECOMMENDATION: {recommendation.company}")
       print(f"{'='*60}\n")
       print(f"Ticker: {recommendation.ticker}")
       print(f"Recommendation: {recommendation.recommendation}")
       print(f"Current Price: ${recommendation.current_price:.2f}")
       print(f"Target Price: ${recommendation.target_price:.2f}")
       print(f"Upside: {recommendation.upside_potential:.1f}%")
       print(f"Confidence: {recommendation.confidence}/10\n")

       print("Key Strengths:")
       for strength in recommendation.key_strengths:
           print(f"  • {strength}")

       print("\nKey Risks:")
       for risk in recommendation.key_risks:
           print(f"  • {risk}")

       print(f"\nInvestment Thesis:\n{recommendation.investment_thesis}")

       return result

   if __name__ == "__main__":
       run()


**Run:**

.. code-block:: bash

   crewai run


Commercial Applications
-----------------------

**Robo-Advisors:** Automated portfolio recommendations

**Wealth Management:** Systematic screening and analysis

**Personal Finance Apps:** User-facing investment guidance

**Research Platforms:** Analyst workflow automation


Enhancements
------------

**Add Financial Data Tool:**

.. code-block:: python

   from crewai.tools import BaseTool
   import yfinance as yf

   class StockDataTool(BaseTool):
       name: str = "Stock Financial Data"
       description: str = "Fetch real-time stock data and financials"

       def _run(self, ticker: str) -> dict:
           stock = yf.Ticker(ticker)
           return {
               "price": stock.info.get("currentPrice"),
               "market_cap": stock.info.get("marketCap"),
               "pe_ratio": stock.info.get("trailingPE"),
               "revenue": stock.info.get("totalRevenue")
           }


**Hierarchical Processing:**

For complex analysis, enable manager coordination:

.. code-block:: python

   crew = Crew(
       agents=self.agents,
       tasks=self.tasks,
       process=Process.HIERARCHICAL,
       manager_llm="gpt-4o"
   )


**Lesson to Remember:**

Stock Picker demonstrates CrewAI's configuration-driven multi-agent patterns. YAML definitions replace code verbosity. Structured outputs ensure consistent data formats. Task context creates information flow between specialists. The pattern generalizes: define roles, assign tasks, configure coordination, execute systematically. CrewAI excels when role-based decomposition and sequential workflows match problem structure.

**Resources:**

- GitHub: https://github.com/ed-donner/agents/tree/main/week-3-crew/stock-picker
- CrewAI Documentation: https://docs.crewai.com
- Related: Engineering Team (Week 3), Trading Floor (Week 6)

---

*Disclaimer: Educational project only. Not financial advice. Consult licensed advisors for investment decisions.*

