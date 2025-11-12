---
layout: post
title: "(Project) SDR Agent: Automated Sales Development Representative"
date: 2025-11-18 00:00:00 +0530
categories: [ai, agents, projects, openai]
tags: [agentic-ai, sales-automation, sdr, sendgrid, email-marketing, openai-agents-sdk]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build an autonomous Sales Development Representative using OpenAI Agents SDK that researches prospects, crafts personalized cold emails, and sends outreach via SendGrid with multi-agent collaboration."
image:
  path: /attachments/posts/2025-11-18-project-sdr-agent-sales-automation/images/preview_art.png
  alt: "SDR Agent Sales Automation"
allow_edit: true
---


SDR Agent: Automated Sales Development Representative
======================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 2 Project | **Framework:** `OpenAI Agents SDK </posts/openai-agents-sdk-framework>`_


Preface: Scaling Human Touch
-----------------------------

Sales development remains intensely human—researching prospects, crafting personalized messages, timing outreach thoughtfully. Yet the process proves remarkably repetitive: same research patterns, similar message structures, predictable workflows. This tension between personalization demands and repetitive execution creates scaling bottlenecks.

Can AI preserve personalization while eliminating repetition?

This project answers affirmatively through autonomous Sales Development Representatives (SDRs)—agents that research prospects, write contextual cold emails, and execute outreach programmatically. Not generic blast campaigns, but genuinely researched, thoughtfully crafted messages generated uniquely per prospect.

The architecture demonstrates OpenAI Agents SDK capabilities through practical B2B application. Multiple specialist agents collaborate: one researches companies, another analyzes fit, a third crafts emails, a coordinator orchestrates. Tools integrate with SendGrid for actual email delivery. Async execution enables processing prospects concurrently. The result: scalable outreach maintaining personalization quality humans achieve manually.

Beyond technical demonstration, this creates genuine commercial value. Early-stage startups scale outbound without hiring SDR teams. Individual consultants execute systematic prospecting. Growth teams test messaging variations rapidly. The agent handles mechanical work—research, drafting, sending—while humans focus on strategy, relationship building, deal closing.

The implementation reveals agent collaboration patterns: agents as tools (specialists consulted by coordinator), handoffs (task delegation), async orchestration (parallel prospect processing). It demonstrates tool integration beyond toy examples—real email API, actual deliverability, production concerns like rate limiting and error handling.

This document guides complete SDR agent construction—from prospect data structures through specialist agent definitions, from email template management to SendGrid integration, from local testing to production safeguards. The result: deployable sales automation demonstrating agentic AI's commercial potential.


.. code-block:: mermaid

   graph TB
       Input[Prospect List] --> Coordinator[SDR Coordinator Agent]
       Coordinator --> Research[Research Agent]
       Coordinator --> FitAnalysis[Fit Analysis Agent]
       Coordinator --> EmailWriter[Email Writer Agent]

       Research --> CompanyData[Company Research]
       FitAnalysis --> Score[Fit Score & Reasoning]
       EmailWriter --> Draft[Personalized Email]

       Draft --> Evaluator[Email Evaluator Agent]
       Evaluator -->|Approved| SendGrid[SendGrid API]
       Evaluator -->|Rejected| EmailWriter

       SendGrid --> Delivery[Email Delivered]

       CompanyData -.context.-> FitAnalysis
       CompanyData -.context.-> EmailWriter
       Score -.context.-> EmailWriter


Project Overview
----------------

Build autonomous SDR that executes complete outbound workflow.

Learning Objectives
~~~~~~~~~~~~~~~~~~~

- **OpenAI Agents SDK:** Practical multi-agent system with tools
- **Agent Collaboration:** Coordinator-worker, agents-as-tools patterns
- **Async Orchestration:** Parallel prospect processing
- **Tool Integration:** SendGrid API for real email delivery
- **Quality Control:** Evaluator pattern ensuring appropriate messaging
- **Production Concerns:** Rate limiting, error handling, dry-run modes

**What You'll Build:**

System that:
1. Receives prospect list (company names, contacts)
2. Researches each company (web search, analysis)
3. Determines product fit score
4. Generates personalized cold email
5. Evaluates email quality
6. Sends via SendGrid (with safeguards)
7. Logs results for follow-up tracking

Architecture
~~~~~~~~~~~~

.. code-block:: mermaid

   sequenceDiagram
       participant P as Prospect List
       participant C as Coordinator
       participant R as Researcher
       participant F as Fit Analyzer
       participant W as Email Writer
       participant E as Evaluator
       participant S as SendGrid

       P->>C: Process prospects
       loop For each prospect
           C->>R: Research company
           R-->>C: Company insights
           C->>F: Analyze fit
           F-->>C: Fit score + reasoning
           C->>W: Write email
           W-->>C: Draft email
           C->>E: Evaluate quality
           alt Quality approved
               E-->>C: Approved
               C->>S: Send email
               S-->>C: Delivery confirmation
           else Quality rejected
               E-->>C: Rejected + feedback
               C->>W: Rewrite with feedback
           end
       end


Prerequisites
-------------

**Technical:**
- OpenAI Agents SDK setup (Week 2 framework)
- SendGrid account (free tier: 100 emails/day)
- Python 3.11+, UV package manager

**Knowledge:**
- Week 2 Day 1-2 content (Agents SDK basics)
- Async Python fundamentals

**API Keys:**
- OpenAI API key
- SendGrid API key


Implementation Guide
--------------------

Step 1: Project Setup
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # Create project
   mkdir sdr-agent && cd sdr-agent

   # Initialize with UV
   uv init
   uv add openai-agents sendgrid python-dotenv

**Directory Structure:**

.. code-block:: text

   sdr-agent/
   ├── .env
   ├── prospects.json
   ├── sdr_agent.py
   └── email_templates.py


Step 2: Environment Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**.env:**

.. code-block:: bash

   OPENAI_API_KEY=sk-proj-xxxxx
   SENDGRID_API_KEY=SG.xxxxx
   FROM_EMAIL=your-email@company.com
   DRY_RUN=true  # Set false for actual sending


**SendGrid Setup:**

1. Sign up at https://sendgrid.com
2. Verify sender email (Settings → Sender Authentication)
3. Create API key (Settings → API Keys)
4. Start with free tier (100/day)


Step 3: Prospect Data Structure
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**prospects.json:**

.. code-block:: json

   [
       {
           "company": "Acme Corp",
           "contact_name": "Jane Smith",
           "contact_email": "jane@acmecorp.com",
           "role": "VP Engineering",
           "linkedin": "https://linkedin.com/in/janesmith"
       },
       {
           "company": "TechStart Inc",
           "contact_name": "Bob Johnson",
           "contact_email": "bob@techstart.io",
           "role": "CTO"
       }
   ]


Step 4: Email Templates
~~~~~~~~~~~~~~~~~~~~~~~~

**email_templates.py:**

.. code-block:: python

   # Email templates and formatting

   def format_email(
       subject: str,
       body: str,
       from_email: str,
       to_email: str,
       to_name: str
   ) -> dict:
       """Format email for SendGrid."""
       return {
           "personalizations": [{
               "to": [{"email": to_email, "name": to_name}],
               "subject": subject
           }],
           "from": {"email": from_email, "name": "Your Company"},
           "content": [{
               "type": "text/plain",
               "value": body
           }]
       }

   COLD_EMAIL_GUIDELINES = """
   Cold Email Best Practices:
   - Keep under 100 words
   - Personalize based on company research
   - Clear value proposition
   - Single call-to-action
   - Professional but conversational tone
   - No aggressive sales language
   - Reference specific company details
   """


Step 5: Specialist Agents
~~~~~~~~~~~~~~~~~~~~~~~~~~

**Research Agent:**

.. code-block:: python

   from openai_agents import Agent
   from dotenv import load_dotenv

   load_dotenv(override=True)

   researcher_agent = Agent(
       name="company_researcher",
       instructions="""You research companies to understand their business.

       Provide:
       - Industry and business model
       - Key products/services
       - Recent news or developments
       - Company size and stage
       - Technology stack (if relevant)

       Be concise but insightful. Focus on details useful for B2B outreach.""",
       model="gpt-4o-mini"
   )


**Fit Analysis Agent:**

.. code-block:: python

   fit_analyzer_agent = Agent(
       name="fit_analyzer",
       instructions="""You analyze whether a prospect is good fit for our product.

       Our Product: [CUSTOMIZE THIS]
       - AI-powered developer tools
       - Target: Tech companies with engineering teams
       - Ideal: 10-500 engineers, B2B SaaS companies

       Rate fit 1-10 and provide reasoning:
       - 8-10: Excellent fit, high priority
       - 5-7: Moderate fit, worth outreach
       - 1-4: Poor fit, skip

       Consider: industry, company stage, team size, tech stack.""",
       model="gpt-4o-mini"
   )


**Email Writer Agent:**

.. code-block:: python

   from email_templates import COLD_EMAIL_GUIDELINES

   email_writer_agent = Agent(
       name="email_writer",
       instructions=f"""You write personalized cold outreach emails.

       {COLD_EMAIL_GUIDELINES}

       Use provided company research and fit analysis to craft targeted message.
       Reference specific company details. Keep professional yet warm.

       Format:
       Subject: [Compelling subject line]

       Body: [Email text]

       End with clear next step (e.g., "Would you be open to a 15-minute call?")""",
       model="gpt-4o"  # Use stronger model for writing
   )


**Email Evaluator Agent:**

.. code-block:: python

   from pydantic import BaseModel

   class EmailEvaluation(BaseModel):
       approved: bool
       score: int  # 1-10
       feedback: str
       issues: list[str]

   evaluator_agent = Agent(
       name="email_evaluator",
       instructions=f"""You evaluate cold email quality before sending.

       {COLD_EMAIL_GUIDELINES}

       Check for:
       - Length (under 100 words preferred)
       - Personalization (mentions specific company details)
       - Clear value proposition
       - Single call-to-action
       - Professional tone
       - No typos or errors
       - Appropriate subject line

       Approve (score 8+) only if email meets all criteria.
       Reject (score <8) with specific improvement feedback.""",
       model="gpt-4o-mini",
       response_format=EmailEvaluation
   )


Step 6: SendGrid Tool
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   import os
   from sendgrid import SendGridAPIClient
   from sendgrid.helpers.mail import Mail

   def send_email_tool(
       to_email: str,
       to_name: str,
       subject: str,
       body: str
   ) -> str:
       """Send email via SendGrid.

       Args:
           to_email: Recipient email
           to_name: Recipient name
           subject: Email subject
           body: Email body text

       Returns:
           Status message
       """
       # Check dry run mode
       if os.getenv("DRY_RUN", "true").lower() == "true":
           return f"[DRY RUN] Would send to {to_name} <{to_email}>:\n\nSubject: {subject}\n\n{body}"

       # Actual sending
       try:
           message = Mail(
               from_email=os.getenv("FROM_EMAIL"),
               to_emails=to_email,
               subject=subject,
               plain_text_content=body
           )

           sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
           response = sg.send(message)

           return f"✓ Email sent to {to_name} (status: {response.status_code})"

       except Exception as e:
           return f"✗ Failed to send to {to_name}: {str(e)}"


Step 7: Coordinator Agent with Tools
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Convert agents to tools
   researcher_tool = researcher_agent.as_tool()
   fit_tool = fit_analyzer_agent.as_tool()
   writer_tool = email_writer_agent.as_tool()

   # Coordinator with all capabilities
   coordinator_agent = Agent(
       name="sdr_coordinator",
       instructions="""You coordinate the SDR workflow:

       1. Research company using research tool
       2. Analyze fit using fit analysis tool
       3. If fit score >= 5, write email using writer tool
       4. Always provide final summary

       Be efficient and systematic.""",
       model="gpt-4o-mini",
       tools=[researcher_tool, fit_tool, writer_tool, send_email_tool]
   )


Step 8: Main SDR Pipeline
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   from openai_agents import Runner
   import json
   import asyncio

   async def process_prospect(prospect: dict, runner: Runner) -> dict:
       """Process single prospect through SDR workflow.

       Args:
           prospect: Prospect data
           runner: Agent runner instance

       Returns:
           Result dictionary
       """
       company = prospect["company"]
       contact = prospect["contact_name"]

       print(f"\n{'='*60}")
       print(f"Processing: {contact} at {company}")
       print(f"{'='*60}\n")

       # Build context message
       message = f"""Process this prospect for outreach:

       Company: {company}
       Contact: {contact}
       Role: {prospect.get('role', 'Unknown')}
       Email: {prospect['contact_email']}

       Execute complete SDR workflow:
       1. Research the company
       2. Analyze fit for our product
       3. If good fit (score >= 5), write and send personalized email

       Provide final status summary."""

       try:
           result = await runner.run_async(
               agent=coordinator_agent,
               input=message
           )

           return {
               "company": company,
               "contact": contact,
               "status": "completed",
               "output": result.output,
               "trace": result.trace
           }

       except Exception as e:
           return {
               "company": company,
               "contact": contact,
               "status": "error",
               "error": str(e)
           }

   async def process_all_prospects(prospects: list[dict]):
       """Process all prospects concurrently."""
       runner = Runner()

       tasks = [
           process_prospect(prospect, runner)
           for prospect in prospects
       ]

       results = await asyncio.gather(*tasks)

       return results


Step 9: Execute and Monitor
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   def main():
       """Main execution function."""
       # Load prospects
       with open("prospects.json", "r") as f:
           prospects = json.load(f)

       print(f"Loaded {len(prospects)} prospects")
       print(f"DRY RUN: {os.getenv('DRY_RUN', 'true')}\n")

       # Process prospects
       results = asyncio.run(process_all_prospects(prospects))

       # Summary
       print(f"\n{'='*60}")
       print("CAMPAIGN SUMMARY")
       print(f"{'='*60}\n")

       completed = sum(1 for r in results if r["status"] == "completed")
       errors = sum(1 for r in results if r["status"] == "error")

       print(f"Total Prospects: {len(prospects)}")
       print(f"Completed: {completed}")
       print(f"Errors: {errors}\n")

       # Detailed results
       for result in results:
           print(f"\n{result['company']} - {result['contact']}:")
           print(f"Status: {result['status']}")
           if result["status"] == "completed":
               print(result["output"][:200] + "...")
           else:
               print(f"Error: {result['error']}")

       # Save results
       with open("campaign_results.json", "w") as f:
           json.dump(results, f, indent=2)

       print("\n✓ Results saved to campaign_results.json")

   if __name__ == "__main__":
       main()


Step 10: Add Quality Gates
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Integrate evaluator before sending:

.. code-block:: python

   async def send_with_evaluation(
       email_draft: str,
       prospect: dict,
       runner: Runner,
       max_retries: int = 2
   ) -> dict:
       """Send email only after quality evaluation.

       Args:
           email_draft: Draft email text
           prospect: Prospect data
           runner: Runner instance
           max_retries: Maximum rewrite attempts

       Returns:
           Result dictionary
       """
       for attempt in range(max_retries):
           # Evaluate email
           eval_result = await runner.run_async(
               agent=evaluator_agent,
               input=f"Evaluate this email:\n\n{email_draft}"
           )

           evaluation: EmailEvaluation = eval_result.output_structured

           if evaluation.approved:
               # Send email
               # Parse subject and body from draft
               lines = email_draft.split("\n")
               subject = lines[0].replace("Subject: ", "")
               body = "\n".join(lines[2:])

               send_result = send_email_tool(
                   to_email=prospect["contact_email"],
                   to_name=prospect["contact_name"],
                   subject=subject,
                   body=body
               )

               return {
                   "sent": True,
                   "attempts": attempt + 1,
                   "message": send_result
               }

           else:
               # Rewrite with feedback
               if attempt < max_retries - 1:
                   rewrite_result = await runner.run_async(
                       agent=email_writer_agent,
                       input=f"Rewrite this email:\n\n{email_draft}\n\n"
                              f"Feedback:\n{evaluation.feedback}"
                   )
                   email_draft = rewrite_result.output

       return {
           "sent": False,
           "attempts": max_retries,
           "message": "Failed quality evaluation after max retries"
       }


Testing and Deployment
----------------------

Test with Safe Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   # .env for testing
   OPENAI_API_KEY=sk-proj-xxxxx
   SENDGRID_API_KEY=SG.xxxxx
   FROM_EMAIL=test@example.com
   DRY_RUN=true  # Emails won't actually send

   # Run
   uv run python sdr_agent.py

Review dry-run output before enabling actual sending.


Production Safeguards
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

   # Add rate limiting
   import time
   from datetime import datetime, timedelta

   class RateLimiter:
       """Enforce email sending limits."""

       def __init__(self, max_per_hour: int = 50):
           self.max_per_hour = max_per_hour
           self.sent_times = []

       def can_send(self) -> bool:
           """Check if can send now."""
           now = datetime.now()
           hour_ago = now - timedelta(hours=1)

           # Remove old timestamps
           self.sent_times = [t for t in self.sent_times if t > hour_ago]

           return len(self.sent_times) < self.max_per_hour

       def record_send(self):
           """Record email sent."""
           self.sent_times.append(datetime.now())

       async def wait_if_needed(self):
           """Wait until can send."""
           while not self.can_send():
               print("Rate limit reached, waiting...")
               await asyncio.sleep(60)

   # Use in pipeline
   rate_limiter = RateLimiter(max_per_hour=50)

   await rate_limiter.wait_if_needed()
   # Send email
   rate_limiter.record_send()


Commercial Applications
-----------------------

Early-Stage Startup Outbound
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Pre-seed startup testing product-market fit

**Configuration:**
- 20-50 prospects/week
- Heavy personalization
- Founder-style messaging
- Rapid iteration on messaging

**Value:** Founder time focuses on conversations, not research/drafting


Consulting Practice Lead Generation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Independent consultant prospecting clients

**Configuration:**
- Industry-specific targeting
- Case study references
- Expertise demonstration
- Relationship-focused tone

**Value:** Systematic prospecting without full-time SDR cost


Growth Team A/B Testing
~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Established SaaS testing messaging variations

**Configuration:**
- Multiple message templates
- Systematic A/B testing
- Analytics integration
- High volume execution

**Value:** Rapid iteration discovering optimal messaging


Partner Outreach Campaigns
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Scenario:** Business development team prospecting partners

**Configuration:**
- Collaboration-focused messaging
- Win-win framing
- Relationship building
- Lower volume, higher touch

**Value:** Scales partnership development beyond small BD teams


Troubleshooting
---------------

Issue: "Emails Generic, Not Personalized"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Emails lack specific company references.

**Solutions:**

1. **Improve Research Quality:**

   .. code-block:: python

      researcher_agent = Agent(
          instructions="""Research company deeply:
          - Visit company website, blog, about page
          - Find recent news (funding, product launches, hiring)
          - Identify specific products/services
          - Note technology stack indicators
          - Find mutual connections if possible

          Provide 5+ specific, actionable details.""",
          model="gpt-4o"  # Upgrade to stronger model
      )

2. **Add Web Search Tool:** Integrate actual search API for current information.

3. **Reference Specific Details:** Update writer instructions to require 2+ specific company mentions.


Issue: "SendGrid Delivery Failures"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Emails not delivering, bounce errors.

**Solutions:**

1. **Verify Sender Email:** Must complete SendGrid sender verification
2. **Warm Up Domain:** Start with low volume, increase gradually
3. **Check Spam Score:** Use tools like mail-tester.com
4. **Add Unsubscribe:** Include unsubscribe link (legal requirement)
5. **Monitor Bounces:** Check SendGrid dashboard for bounce reasons


Issue: "Rate Limit Errors"
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** OpenAI or SendGrid rate limit errors.

**Solutions:**

.. code-block:: python

   # Exponential backoff
   import time
   from tenacity import retry, wait_exponential, stop_after_attempt

   @retry(
       wait=wait_exponential(multiplier=1, min=4, max=60),
       stop=stop_after_attempt(5)
   )
   async def call_with_retry(agent, input):
       """Call agent with automatic retry."""
       return await runner.run_async(agent=agent, input=input)


Lesson to Remember
------------------

The SDR Agent demonstrates agentic AI's commercial viability through practical B2B automation. Multi-agent collaboration (research, analysis, writing, evaluation) produces quality matching human SDRs while scaling beyond human capacity. Tool integration (SendGrid) bridges AI capabilities to real-world actions. Quality gates (evaluation loops) ensure professional standards.

The pattern generalizes: orchestrate specialist agents, integrate action APIs, validate quality, scale execution. This architecture applies beyond sales—support ticket handling, content generation pipelines, research workflows, anywhere specialized roles collaborate toward outputs requiring quality validation before execution.

More profoundly, the project reveals tension between automation and authenticity. Pure automation produces generic spam. Pure manual work doesn't scale. The synthesis—AI handles research/drafting mechanics, humans guide strategy/relationships—delivers personalization at scale. The future of many knowledge workflows likely follows this pattern: AI handling repetitive cognitive work, humans handling judgment/relationships.


Resources & Further Learning
-----------------------------

**Project Code:**
- GitHub: https://github.com/ed-donner/agents/tree/main/week-2-openai

**Related Materials:**
- OpenAI Agents SDK Framework
- SendGrid Documentation: https://docs.sendgrid.com
- Cold Email Best Practices

**Next Projects:**
- Deep Research Agent: Multi-agent web research
- Stock Picker: CrewAI multi-agent investment analysis

---

*Deploy responsibly: respect opt-outs, comply with anti-spam laws (CAN-SPAM, GDPR), prioritize recipient experience over volume metrics.*

