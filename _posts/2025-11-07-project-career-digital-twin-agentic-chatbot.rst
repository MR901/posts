---
layout: post
title: "(Project) Career Digital Twin: Your Professional AI Representative"
date: 2025-11-17 00:00:00 +0530
categories: [ai, agents, projects]
tags: [agentic-ai, career-chatbot, gradio, huggingface, tool-calling, pushover, resources]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build a production-ready conversational agent that represents your professional experience, deployable on personal websites with tool integration for contact collection and question tracking via mobile notifications."
image:
  path: /attachments/posts/2025-11-17-project-career-digital-twin-agentic-chatbot/images/preview_art.png
  alt: "Career Digital Twin Project"
allow_edit: true
---


Career Digital Twin: Your Professional AI Representative
=========================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 1 Project | **Prerequisites:** Week 1 Foundations


Preface: The Future of Professional Presence
---------------------------------------------

The traditional resume proves increasingly inadequate. Static documents fail to capture personality, struggle to answer nuanced questions, cannot engage in dialogue. Hiring managers scan hundreds of PDFs, missing subtleties that conversation reveals naturally.

What if professional representation transcended paper?

Imagine prospective employers or clients visiting your website, engaging directly with an AI that knows your experience intimately—answering questions about projects, explaining technical decisions, describing challenges overcome. Not generic responses, but authentic representation reflecting your unique background, speaking in professionally appropriate ways about your specific accomplishments.

This project builds exactly that: a Career Digital Twin—a conversational agent serving as your professional representative, available 24/7 on your personal website.

The system demonstrates foundational agentic AI concepts through practical application. Resources (LinkedIn profile, career summary) provide knowledge base. Tools (contact recording, question logging) enable real-world action. Structured outputs (evaluation system) ensure quality. Gradio provides interface. Hugging Face Spaces enables deployment. Pushover delivers mobile notifications when visitors express interest.

Beyond technical demonstration, this creates genuine professional value. Deploy on personal websites, share with recruiters, embed in portfolios. Potential employers interact directly, asking questions beyond resume scope. Clients explore experience conversationally. The agent represents you professionally while you sleep.

The architecture proves remarkably simple—no frameworks beyond OpenAI's Python client, no complex orchestrations, just resources, tools, and clean implementation. Yet simplicity enables sophistication: the agent handles unknown questions gracefully, collects contact information naturally, operates within professional communication guidelines.

This document guides complete implementation—from resource preparation through tool integration, from local development to production deployment, from basic functionality to quality guardrails. The result: a deployable professional asset demonstrating agentic AI mastery while serving genuine career purposes.


.. code-block:: mermaid

   graph TB
       User[Website Visitor] --> Gradio[Gradio Interface]
       Gradio --> Agent[Career Agent]
       Agent --> LLM[GPT-4o-mini]
       Agent --> Resources[Resources:<br/>LinkedIn PDF<br/>Career Summary]
       Agent --> Tools[Tools]
       Tools --> ContactTool[Record Contact Details]
       Tools --> QuestionTool[Record Unknown Question]
       ContactTool --> Pushover[Push Notification]
       QuestionTool --> Pushover
       Pushover --> Phone[Your Mobile Device]
       LLM --> Response[Professional Response]
       Response --> Gradio


Project Overview
----------------

Build a conversational agent that authentically represents professional experience.


Learning Objectives
~~~~~~~~~~~~~~~~~~~

- **Resources:** Augment agent knowledge with documents (LinkedIn, summaries)
- **Tools:** Implement function calling for real-world actions
- **Tool Mechanics:** Understand JSON schemas, dynamic execution, feedback loops
- **Pushover Integration:** Send mobile notifications from agent actions
- **Gradio:** Create web interfaces for agent interaction
- **Hugging Face Spaces:** Deploy production-ready applications
- **Professional Prompting:** Craft system prompts ensuring appropriate communication

**What You'll Build:**

A complete web application where:

1. Visitors ask about your career, skills, experience
2. Agent responds knowledgeably using your LinkedIn/resume as context
3. If question unanswerable, agent logs it and notifies you
4. If visitor wants contact, agent collects email and notifies you
5. All interactions maintain professional tone and helpfulness
6. Application runs publicly, accessible via URL, embeddable in websites


Architecture
~~~~~~~~~~~~

.. code-block:: mermaid

   sequenceDiagram
       participant V as Visitor
       participant G as Gradio UI
       participant A as Agent
       participant L as LLM (GPT-4o-mini)
       participant T as Tools
       participant P as Pushover

       V->>G: Ask question
       G->>A: Process message
       A->>L: Send with resources + tools

       alt Question answerable
           L->>A: Text response
           A->>G: Display response
           G->>V: Show answer
       else Unknown question
           L->>A: Call record_unknown_question
           A->>T: Execute tool
           T->>P: Send notification
           P->>V: Pushover alert
           T->>A: Confirmation
           A->>L: Generate response with confirmation
           L->>A: Professional acknowledgment
           A->>G: Display response
           G->>V: Show acknowledgment
       else Visitor wants contact
           L->>A: Call record_user_details
           A->>T: Execute tool
           T->>P: Send notification
           P->>V: Pushover alert
           T->>A: Confirmation
           A->>L: Generate response
           L->>A: Thank you message
           A->>G: Display response
           G->>V: Show confirmation
       end


Prerequisites
-------------

**Technical Requirements:**

- Python 3.12+ environment
- UV package manager (or pip)
- OpenAI API key
- Pushover account (free tier sufficient)
- Hugging Face account (for deployment)

**Knowledge Prerequisites:**

- Week 1 foundational content (LLM orchestration, tool basics)
- Basic Python familiarity
- Understanding of API calls and environment variables

**Resources to Prepare:**

1. **LinkedIn PDF:** Export your profile to PDF from LinkedIn
2. **Career Summary:** Write 2-3 paragraphs about your background, including interesting personal facts


Implementation Guide
--------------------

Step 1: Prepare Resources
~~~~~~~~~~~~~~~~~~~~~~~~~~

Create project structure:

.. code-block:: bash

   career-digital-twin/
   ├── me/
   │   ├── linkedin.pdf      # Your LinkedIn export
   │   └── summary.txt        # Career summary
   ├── .env                   # API keys
   ├── app.py                 # Main application
   └── requirements.txt       # Dependencies


**me/summary.txt Example:**

.. code-block:: text

   John Smith is a senior software engineer with 10 years of experience building
   scalable web applications. Specialized in Python, cloud architecture, and
   leading technical teams. Previously worked at Tech Corp as Engineering Manager,
   leading team of 8 developers building e-commerce platform serving 1M+ users.

   Outside work, John is passionate about open-source contribution, having
   maintained popular Python libraries with 50K+ downloads. Enjoys hiking,
   photography, and teaching programming to beginners through local meetups.

**Export LinkedIn PDF:**

1. Go to LinkedIn profile
2. Click "More" → "Save to PDF"
3. Save as `me/linkedin.pdf`


Step 2: Environment Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Install Dependencies:**

.. code-block:: bash

   # Create .env file
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PUSHOVER_USER=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PUSHOVER_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


**Pushover Setup:**

1. Sign up at https://pushover.net (free)
2. Note your User Key
3. Create application, note Token
4. Install Pushover app on mobile device

**requirements.txt:**

.. code-block:: text

   openai
   python-dotenv
   gradio
   pypdf
   requests


**Install:**

.. code-block:: bash

   uv pip install -r requirements.txt
   # or
   pip install -r requirements.txt


Step 3: Load Resources
~~~~~~~~~~~~~~~~~~~~~~~

**app.py - Resource Loading:**

.. code-block:: python

   import os
   import pypdf
   from dotenv import load_dotenv
   from openai import OpenAI

   # Load environment variables
   load_dotenv(override=True)

   # Initialize OpenAI client
   client = OpenAI()

   # Load LinkedIn PDF
   def load_linkedin() -> str:
       """Extract text from LinkedIn PDF."""
       reader = pypdf.PdfReader("me/linkedin.pdf")
       pages = [page.extract_text() for page in reader.pages]
       return "\n\n".join(pages)

   # Load career summary
   def load_summary() -> str:
       """Load career summary text."""
       with open("me/summary.txt", "r") as f:
           return f.read()

   # Load resources
   linkedin_text = load_linkedin()
   summary_text = load_summary()

   # Your name (update this!)
   YOUR_NAME = "John Smith"

   print(f"✓ Loaded LinkedIn profile: {len(linkedin_text)} characters")
   print(f"✓ Loaded summary: {len(summary_text)} characters")


Step 4: Implement Tools
~~~~~~~~~~~~~~~~~~~~~~~~

**Tool Functions:**

.. code-block:: python

   import requests
   import json

   def record_user_details(email: str, name: str = None, notes: str = None) -> str:
       """Record that a user wants to be contacted.

       Args:
           email: User's email address
           name: User's name (optional)
           notes: Additional context (optional)

       Returns:
           Confirmation message
       """
       # Build notification message
       message = f"📧 Contact Request!\n\nEmail: {email}"
       if name:
           message += f"\nName: {name}"
       if notes:
           message += f"\nNotes: {notes}"

       # Send push notification
       requests.post("https://api.pushover.net/1/messages.json", data={
           "token": os.getenv("PUSHOVER_TOKEN"),
           "user": os.getenv("PUSHOVER_USER"),
           "message": message
       })

       return f"Thank you! I've recorded your details and will be in touch soon."

   def record_unknown_question(question: str) -> str:
       """Record a question that couldn't be answered.

       Args:
           question: The unanswerable question

       Returns:
           Acknowledgment message
       """
       message = f"❓ Question I couldn't answer:\n\n{question}"

       # Send push notification
       requests.post("https://api.pushover.net/1/messages.json", data={
           "token": os.getenv("PUSHOVER_TOKEN"),
           "user": os.getenv("PUSHOVER_USER"),
           "message": message
       })

       return "I've noted your question. I'll make sure to prepare an answer."


**Tool Definitions (JSON Schemas):**

.. code-block:: python

   TOOLS = [
       {
           "type": "function",
           "function": {
               "name": "record_user_details",
               "description": "Use this tool to record that a user is interested in "
                              "being contacted and provided an email address.",
               "parameters": {
                   "type": "object",
                   "properties": {
                       "email": {
                           "type": "string",
                           "description": "User's email address"
                       },
                       "name": {
                           "type": "string",
                           "description": "User's name, if provided"
                       },
                       "notes": {
                           "type": "string",
                           "description": "Any additional context about user's interest"
                       }
                   },
                   "required": ["email"],
                   "additionalProperties": False
               }
           }
       },
       {
           "type": "function",
           "function": {
               "name": "record_unknown_question",
               "description": "Use this tool to record questions you cannot answer "
                              "based on available information.",
               "parameters": {
                   "type": "object",
                   "properties": {
                       "question": {
                           "type": "string",
                           "description": "The question that couldn't be answered"
                       }
                   },
                   "required": ["question"],
                   "additionalProperties": False
               }
           }
       }
   ]


Step 5: Tool Execution Handler
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Dynamic Tool Execution:**

.. code-block:: python

   def handle_tool_calls(tool_calls) -> list[dict]:
       """Execute requested tools and return results.

       Args:
           tool_calls: Tool call objects from OpenAI response

       Returns:
           List of tool result messages
       """
       results = []

       for tool_call in tool_calls:
           function_name = tool_call.function.name
           function_args = json.loads(tool_call.function.arguments)

           print(f"🔧 Calling tool: {function_name}({function_args})")

           # Dynamic function lookup and execution
           function_result = globals()[function_name](**function_args)

           results.append({
               "role": "tool",
               "tool_call_id": tool_call.id,
               "content": function_result
           })

       return results

This uses `globals()` for dynamic function lookup—finding functions by name string.


Step 6: System Prompt
~~~~~~~~~~~~~~~~~~~~~~

**Professional Instructions:**

.. code-block:: python

   SYSTEM_PROMPT = f"""You are acting as {YOUR_NAME}.
   You answer questions on their website, particularly related to career background,
   skills, experience, and professional accomplishments.

   Your responsibility is to represent {YOUR_NAME} faithfully and professionally.
   Be warm, engaging, and authentic while maintaining professionalism.

   # Career Summary
   {summary_text}

   # LinkedIn Profile
   {linkedin_text}

   ## Important Instructions

   - If you don't know the answer to any question, use your tool to record it
   - If the user expresses interest in connecting, encourage them to share their
     email address and use your tool to record their contact details
   - Always be helpful, professional, and authentic
   - Never make up information not present in the provided context
   - If asked about topics outside career/professional scope, politely redirect

   With this context, please engage with visitors professionally and helpfully.
   """


Step 7: Complete Chat Function
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Main Chat Logic with Tool Support:**

.. code-block:: python

   def chat(message: str, history: list) -> str:
       """Handle one conversation turn with tool support.

       Args:
           message: User's message
           history: Conversation history (Gradio format)

       Returns:
           Agent's response
       """
       # Build messages list
       messages = [{"role": "system", "content": SYSTEM_PROMPT}]

       # Add history
       for human, assistant in history:
           messages.append({"role": "user", "content": human})
           messages.append({"role": "assistant", "content": assistant})

       # Add current message
       messages.append({"role": "user", "content": message})

       # Loop until we get final response (not tool calls)
       done = False
       while not done:
           response = client.chat.completions.create(
               model="gpt-4o-mini",
               messages=messages,
               tools=TOOLS
           )

           response_message = response.choices[0].message
           finish_reason = response.choices[0].finish_reason

           if finish_reason == "tool_calls":
               # Model wants to execute tools
               messages.append(response_message)

               # Execute tools
               tool_results = handle_tool_calls(response_message.tool_calls)
               messages.extend(tool_results)

               # Loop continues to get final response
           else:
               # Model provided final answer
               done = True
               return response_message.content


Step 8: Gradio Interface
~~~~~~~~~~~~~~~~~~~~~~~~~

**Create Web UI:**

.. code-block:: python

   import gradio as gr

   # Create chat interface
   interface = gr.ChatInterface(
       fn=chat,
       title=f"Chat with {YOUR_NAME}",
       description=f"Ask me about my professional background, skills, and experience.",
       examples=[
           "What's your current role?",
           "Tell me about your biggest accomplishment",
           "What technologies do you specialize in?",
           "What's a challenging project you've worked on?"
       ],
       theme=gr.themes.Soft(),
       retry_btn=None,
       undo_btn=None,
       clear_btn="Clear Conversation"
   )

   if __name__ == "__main__":
       interface.launch()

**Run Locally:**

.. code-block:: bash

   python app.py

Opens browser with chat interface.


Step 9: Test Functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Test Scenarios:**

1. **Basic Questions:**

   .. code-block:: text

      User: What's your current job?
      Agent: I'm currently [responds with actual role from LinkedIn]

2. **Unknown Questions:**

   .. code-block:: text

      User: What's your favorite ice cream flavor?
      Agent: [Calls record_unknown_question tool]
      Agent: I've noted your question...
      [You receive push notification]

3. **Contact Collection:**

   .. code-block:: text

      User: I'd like to get in touch. My email is user@example.com
      Agent: [Calls record_user_details tool]
      Agent: Thank you! I've recorded your details...
      [You receive push notification with email]


Step 10: Deploy to Production
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Prepare for Deployment:**

Create `requirements.txt` (already done above).

**Deploy to Hugging Face Spaces:**

.. code-block:: bash

   # In project directory
   gradio deploy

**Deployment Prompts:**

1. **Space name:** `career-conversation` (or your choice)
2. **App file:** `app.py`
3. **Hardware:** `cpu-basic` (free tier)
4. **Secrets:**

   - `OPENAI_API_KEY`: Your API key
   - `PUSHOVER_USER`: Your Pushover user ID
   - `PUSHOVER_TOKEN`: Your Pushover app token

**Result:**

Application deploys to: `https://huggingface.co/spaces/{username}/career-conversation`

**Embed in Personal Website:**

.. code-block:: html

   <iframe
       src="https://huggingface.co/spaces/{username}/career-conversation"
       width="100%"
       height="600px"
       frameborder="0"
   ></iframe>


Enhancements and Exercises
---------------------------

Extend the baseline implementation:


Add Evaluation System
~~~~~~~~~~~~~~~~~~~~~~

Implement Week 1's evaluator-optimizer pattern:

.. code-block:: python

   from pydantic import BaseModel

   class ResponseEvaluation(BaseModel):
       is_professional: bool
       is_accurate: bool
       feedback: str

   def evaluate_response(response: str, question: str) -> ResponseEvaluation:
       """Validate response before sending."""
       # Use Gemini for evaluation (free tier)
       evaluator = OpenAI(
           api_key=os.getenv("GOOGLE_API_KEY"),
           base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
       )

       eval_response = evaluator.beta.chat.completions.parse(
           model="gemini-2.0-flash",
           messages=[{
               "role": "user",
               "content": f"Evaluate professionalism of this response:\n\n"
                          f"Q: {question}\nA: {response}"
           }],
           response_format=ResponseEvaluation
       )

       return eval_response.choices[0].message.parsed

Integrate into chat loop for automatic quality validation.


Add More Tools
~~~~~~~~~~~~~~

Expand capabilities:

.. code-block:: python

   def schedule_meeting(preferred_times: list[str]) -> str:
       """Schedule meeting via calendar API."""
       ...

   def query_portfolio(project_name: str) -> str:
       """Fetch detailed project information."""
       ...

   def check_availability(date: str) -> bool:
       """Check calendar availability."""
       ...


Enhance Resources
~~~~~~~~~~~~~~~~~

Richer knowledge base:

- Multiple PDF documents (publications, testimonials, project write-ups)
- Structured JSON data (skills taxonomy, project details)
- Dynamic content (recent blog posts via API)


Implement RAG
~~~~~~~~~~~~~

For extensive resources, implement retrieval:

.. code-block:: python

   from chromadb import Client
   from chromadb.utils import embedding_functions

   # Create vector database
   chroma_client = Client()
   embedding_function = embedding_functions.OpenAIEmbeddingFunction(
       api_key=os.getenv("OPENAI_API_KEY"),
       model_name="text-embedding-3-small"
   )

   collection = chroma_client.create_collection(
       name="career_knowledge",
       embedding_function=embedding_function
   )

   # Add documents
   collection.add(
       documents=[doc1, doc2, doc3],
       ids=["doc1", "doc2", "doc3"]
   )

   # Query for relevant context
   results = collection.query(
       query_texts=[message],
       n_results=3
   )

   # Use results as resources in system prompt


Commercial Applications
-----------------------

Beyond personal use, this pattern applies broadly:


Customer Support Bots
~~~~~~~~~~~~~~~~~~~~~

Replace static FAQs with conversational agents:

- Resources: Product documentation, support articles
- Tools: Create support tickets, check order status, process refunds
- Deployment: Embed on support pages

**Value:** 24/7 support, natural language interaction, seamless escalation to humans


Company Information Agents
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Help customers learn about businesses:

- Resources: Company history, product catalogs, pricing sheets
- Tools: Send product brochures, request quotes, schedule demos
- Deployment: Main website, landing pages

**Value:** Engaging alternative to static content, lead capture, qualification


Employee Onboarding Assistants
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Guide new hires:

- Resources: Employee handbook, policies, org charts
- Tools: Schedule meetings with team members, assign training, answer questions
- Deployment: Internal intranet

**Value:** Reduces HR workload, provides consistent information, tracks common questions


Sales Development Representatives
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Automate initial outreach:

- Resources: Product details, case studies, pricing
- Tools: Send emails, schedule calls, update CRM
- Deployment: Integrated with website, email campaigns

**Value:** Scales outbound efforts, qualifies leads, personalizes communication

This pattern—resources providing knowledge, tools enabling action, conversational interface, production deployment—applies across domains wherever expertise needs representation.


Troubleshooting
---------------

Common issues and solutions:


Issue: "Tool Not Called When Expected"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Agent generates text response instead of using tool.

**Solutions:**

1. **Make Tool Description Explicit:**

   .. code-block:: python

      "description": "ALWAYS use this tool when user provides email address. "
                     "Use when user says 'contact me', 'get in touch', etc."

2. **Mention Tools in System Prompt:**

   .. code-block:: python

      SYSTEM_PROMPT += "\n\nIMPORTANT: When users want to connect, "
                       "use your contact recording tool. When you can't "
                       "answer questions, use your question recording tool."

3. **Upgrade Model:** GPT-4o-mini occasionally misses tool opportunities. Try `gpt-4o`.


Issue: "Push Notifications Not Arriving"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** Tools execute but phone doesn't receive notifications.

**Solutions:**

1. **Verify Pushover Setup:**

   - Confirm User Key and Token in `.env`
   - Check Pushover app installed on phone
   - Test manually: https://pushover.net/apps/build

2. **Check Network:**

   .. code-block:: python

      response = requests.post("https://api.pushover.net/1/messages.json", ...)
      print(f"Status: {response.status_code}")
      print(f"Response: {response.json()}")

3. **Enable Notifications:** Verify phone settings allow Pushover notifications.


Issue: "Gradio Deploy Fails"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:** `gradio deploy` errors or deployment doesn't work.

**Solutions:**

1. **Verify Hugging Face Authentication:**

   .. code-block:: bash

      huggingface-cli login

2. **Check requirements.txt:** Ensure all dependencies listed.

3. **Test Locally First:** Confirm `python app.py` works before deploying.

4. **Review Logs:** Check Hugging Face Spaces logs for errors.


Lesson to Remember
------------------

The Career Digital Twin demonstrates that production-ready agentic applications need not require complex frameworks. Direct LLM orchestration, thoughtful resource integration, clean tool implementation, and modern deployment platforms combine to create genuinely useful professional assets.

The pattern generalizes: augment models with domain knowledge (resources), enable real-world actions (tools), provide accessible interfaces (Gradio), deploy publicly (Hugging Face Spaces). This foundation supports countless applications across domains and use cases.

More profoundly, the project illustrates agentic AI's promise: software that represents human expertise, answers questions authentically, takes appropriate actions, operates autonomously yet professionally. The future of digital presence may well involve AI twins operating on our behalf—and understanding how to build them positions practitioners at this frontier.


Resources & Further Learning
-----------------------------

**Project Code:**

- GitHub: https://github.com/ed-donner/agents/tree/main/week-1-foundations
- Complete Implementation: `app.py`
- Example Resources: `me/` directory

**Related Learning:**

- Week 1 Foundations: Tool mechanics, resources, structured outputs
- Gradio Documentation: https://www.gradio.app/docs
- Pushover API: https://pushover.net/api
- Hugging Face Spaces: https://huggingface.co/spaces

**Next Projects:**

- SDR Agent (Week 2): Automated sales outreach
- Deep Research Agent (Week 2): Multi-agent web research system

---

*Deploy your Career Digital Twin and share it! Post on LinkedIn tagging the course to showcase your agentic AI capabilities to prospective employers and clients.*

