---
layout: post
title: "(Project) Trading Floor: Multi-Agent Trading System with MCP Integration"
date: 2025-11-24 00:00:00 +0530
categories: [ai, agents, projects, mcp, capstone]
tags: [agentic-ai, mcp, trading-agents, polygon-api, financial-markets, multi-agent-systems, model-context-protocol]
pin: false
toc: true
comments: false
math: false
mermaid: true
description: "Build a complete autonomous trading floor with 44 specialized tools using Model Context Protocol (MCP) to integrate real-time market data, technical analysis, news sentiment, and multi-agent collaboration for systematic trading decisions."
image:
  path: /attachments/posts/2025-11-24-project-trading-floor-capstone-mcp/images/preview_art.png
  alt: "Trading Floor Multi-Agent System"
allow_edit: true
---


Trading Floor: Multi-Agent Trading System with MCP
===================================================

**Course Navigation:** `Main Course Hub </posts/udemy-course-agentic-ai-agent-mcp>`_ | **Week:** 6 Capstone | **Framework:** `MCP </posts/mcp-model-context-protocol>`_


Preface: The Synthesis Project
-------------------------------

Six weeks of agentic AI development culminate here: a production-grade trading system synthesizing every pattern encountered. Multi-agent collaboration (Week 1-5 frameworks), tool integration (OpenAI SDK), role-based teams (CrewAI), stateful workflows (LangGraph), distributed execution (Autogen), all unified through Model Context Protocol—the open standard connecting AI models to data sources.

Trading floors epitomize complex multi-agent systems: specialists analyzing market data, fundamental researchers evaluating companies, technical analysts identifying patterns, risk managers assessing exposure, portfolio managers coordinating decisions. Human trading floors scale poorly—limited specialists, bounded processing capacity, emotional biases.

Agentic trading floors transcend these limits: 44 specialized tools providing comprehensive market access, multiple AI agents collaborating systematically, emotion-free systematic execution, 24/7 operation monitoring global markets. Not replacing human judgment but augmenting it—handling data processing, pattern recognition, systematic analysis while humans provide strategy, risk parameters, oversight.

The architecture demonstrates MCP's transformative impact: instead of hardcoding API integrations per agent framework, MCP servers expose tools universally. Any MCP client (Claude Desktop, custom agents, future frameworks) accesses the same capabilities through standardized protocol. Build once, use everywhere.

This project synthesizes course learning into production system: real market data (Polygon API), comprehensive tooling (44 tools across market data, technical indicators, news, fundamentals), safety mechanisms (paper trading, position limits, risk checks), professional architecture (error handling, logging, monitoring).

.. code-block:: mermaid

   graph TB
       subgraph "MCP Servers"
           P[Polygon MCP Server<br/>Market Data + News]
           T[Technical Analysis<br/>Indicators + Patterns]
           F[Fundamental Data<br/>Financials + Valuation]
       end

       subgraph "Agent Team"
           M[Market Monitor<br/>Real-time Data]
           TA[Technical Analyst<br/>Chart Patterns]
           FA[Fundamental Analyst<br/>Company Analysis]
           S[Sentiment Analyst<br/>News Processing]
           R[Risk Manager<br/>Position Limits]
           PM[Portfolio Manager<br/>Coordinator]
       end

       P --> M
       P --> S
       T --> TA
       F --> FA

       M --> PM
       TA --> PM
       FA --> PM
       S --> PM
       R --> PM

       PM --> Decision[Trading Decision]
       Decision --> Execution[Paper Trading<br/>Simulated Orders]


Project Overview
----------------

**What You'll Build:**

Autonomous trading floor with:
- 44 specialized tools via MCP servers
- 6 specialized trading agents
- Real-time market data integration (Polygon)
- Technical analysis (20+ indicators)
- Fundamental analysis (financial metrics)
- News sentiment analysis
- Risk management system
- Paper trading execution
- Gradio monitoring dashboard

**Learning Objectives:**

- MCP server development and hosting
- MCP client integration with agents
- Multi-agent trading workflows
- Real-time financial data handling
- Risk management patterns
- Production safety mechanisms


MCP Architecture
----------------

**Three MCP Servers:**

1. **Polygon Server:** Market data, news, aggregates
2. **Technical Analysis Server:** Indicators (RSI, MACD, Bollinger Bands, etc.)
3. **Fundamental Data Server:** Financials, ratios, valuation metrics

**Protocol Benefits:**

- **Standardization:** Same tools work across frameworks
- **Reusability:** Build servers once, use across projects
- **Isolation:** Tool logic separate from agent logic
- **Marketplace:** Share servers publicly via MCP marketplace


Implementation Guide
--------------------

**Step 1: Setup MCP Development Environment**

.. code-block:: bash

   # Create project
   mkdir trading-floor && cd trading-floor

   # Install MCP SDK and dependencies
   uv init
   uv add mcp anthropic polygon-api-client pandas ta-lib


**Step 2: Polygon MCP Server**

**polygon_server/server.py:**

.. code-block:: python

   from mcp.server import Server, Tool
   from mcp.server.stdio import stdio_server
   from polygon import RESTClient
   import os

   # Initialize Polygon client
   polygon_client = RESTClient(api_key=os.getenv("POLYGON_API_KEY"))

   # Create MCP server
   server = Server("polygon-market-data")

   @server.tool()
   async def get_stock_quote(symbol: str) -> dict:
       """Get real-time stock quote.

       Args:
           symbol: Stock ticker (e.g., AAPL)

       Returns:
           Quote data with price, volume, etc.
       """
       quote = polygon_client.get_last_quote(symbol)
       return {
           "symbol": symbol,
           "price": quote.last.price,
           "bid": quote.last.bid_price,
           "ask": quote.last.ask_price,
           "volume": quote.last.size
       }

   @server.tool()
   async def get_historical_bars(
       symbol: str,
       timespan: str = "day",
       limit: int = 100
   ) -> list[dict]:
       """Get historical price bars.

       Args:
           symbol: Stock ticker
           timespan: Bar interval (minute, hour, day)
           limit: Number of bars

       Returns:
           List of OHLCV bars
       """
       bars = polygon_client.get_aggs(
           symbol,
           1,
           timespan,
           from_="2024-01-01",
           to="2024-12-31",
           limit=limit
       )

       return [
           {
               "timestamp": bar.timestamp,
               "open": bar.open,
               "high": bar.high,
               "low": bar.low,
               "close": bar.close,
               "volume": bar.volume
           }
           for bar in bars
       ]

   @server.tool()
   async def get_company_news(
       symbol: str,
       limit: int = 10
   ) -> list[dict]:
       """Get recent news for company.

       Args:
           symbol: Stock ticker
           limit: Number of articles

       Returns:
           List of news articles
       """
       news = polygon_client.list_ticker_news(
           ticker=symbol,
           limit=limit
       )

       return [
           {
               "title": article.title,
               "published": article.published_utc,
               "url": article.article_url,
               "description": article.description
           }
           for article in news
       ]

   # Run server
   if __name__ == "__main__":
       import asyncio
       asyncio.run(stdio_server(server))


**Step 3: Technical Analysis MCP Server**

**technical_server/server.py:**

.. code-block:: python

   from mcp.server import Server
   from mcp.server.stdio import stdio_server
   import pandas as pd
   import ta

   server = Server("technical-analysis")

   @server.tool()
   async def calculate_rsi(prices: list[float], period: int = 14) -> dict:
       """Calculate Relative Strength Index.

       Args:
           prices: List of closing prices
           period: RSI period

       Returns:
           RSI value and interpretation
       """
       df = pd.DataFrame({"close": prices})
       rsi = ta.momentum.RSIIndicator(df["close"], window=period)
       current_rsi = rsi.rsi().iloc[-1]

       interpretation = "neutral"
       if current_rsi > 70:
           interpretation = "overbought"
       elif current_rsi < 30:
           interpretation = "oversold"

       return {
           "rsi": current_rsi,
           "interpretation": interpretation,
           "period": period
       }

   @server.tool()
   async def calculate_macd(prices: list[float]) -> dict:
       """Calculate MACD indicator.

       Args:
           prices: List of closing prices

       Returns:
           MACD values and signal
       """
       df = pd.DataFrame({"close": prices})
       macd = ta.trend.MACD(df["close"])

       return {
           "macd": macd.macd().iloc[-1],
           "signal": macd.macd_signal().iloc[-1],
           "histogram": macd.macd_diff().iloc[-1],
           "interpretation": "bullish" if macd.macd_diff().iloc[-1] > 0 else "bearish"
       }

   @server.tool()
   async def calculate_bollinger_bands(
       prices: list[float],
       period: int = 20,
       std_dev: int = 2
   ) -> dict:
       """Calculate Bollinger Bands.

       Args:
           prices: List of closing prices
           period: Moving average period
           std_dev: Standard deviations

       Returns:
           Bollinger Band values
       """
       df = pd.DataFrame({"close": prices})
       bb = ta.volatility.BollingerBands(
           df["close"],
           window=period,
           window_dev=std_dev
       )

       current_price = prices[-1]
       upper = bb.bollinger_hband().iloc[-1]
       lower = bb.bollinger_lband().iloc[-1]

       position = "middle"
       if current_price > upper:
           position = "above_upper"
       elif current_price < lower:
           position = "below_lower"

       return {
           "upper_band": upper,
           "middle_band": bb.bollinger_mavg().iloc[-1],
           "lower_band": lower,
           "current_price": current_price,
           "position": position
       }

   if __name__ == "__main__":
       import asyncio
       asyncio.run(stdio_server(server))


**Step 4: Configure MCP Client**

**mcp_config.json:**

.. code-block:: json

   {
     "mcpServers": {
       "polygon": {
         "command": "uv",
         "args": ["run", "polygon_server/server.py"],
         "env": {
           "POLYGON_API_KEY": "your_polygon_key"
         }
       },
       "technical": {
         "command": "uv",
         "args": ["run", "technical_server/server.py"]
       },
       "fundamental": {
         "command": "uv",
         "args": ["run", "fundamental_server/server.py"]
       }
     }
   }


**Step 5: Trading Agents with MCP**

.. code-block:: python

   from anthropic import Anthropic
   from mcp import ClientSession, StdioServerParameters
   from mcp.client.stdio import stdio_client

   # Initialize Anthropic client
   anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

   # Connect to MCP servers
   polygon_server = StdioServerParameters(
       command="uv",
       args=["run", "polygon_server/server.py"],
       env={"POLYGON_API_KEY": os.getenv("POLYGON_API_KEY")}
   )

   async def create_trading_agents():
       """Create trading agent team with MCP tools."""

       # Connect to MCP servers
       async with stdio_client(polygon_server) as (read, write):
           async with ClientSession(read, write) as session:
               await session.initialize()

               # List available tools
               tools_result = await session.list_tools()
               available_tools = tools_result.tools

               # Technical Analyst Agent
               technical_analyst = {
                   "name": "technical_analyst",
                   "instructions": """You analyze price charts and technical indicators.

                   Use available tools to:
                   - Get historical price data
                   - Calculate RSI, MACD, Bollinger Bands
                   - Identify chart patterns
                   - Determine technical buy/sell signals

                   Provide clear technical recommendations with supporting data.""",
                   "tools": available_tools
               }

               # Fundamental Analyst Agent
               fundamental_analyst = {
                   "name": "fundamental_analyst",
                   "instructions": """You analyze company fundamentals.

                   Use available tools to:
                   - Get company financial data
                   - Calculate valuation metrics (P/E, P/B, etc.)
                   - Assess financial health
                   - Determine fair value estimates

                   Provide fundamental buy/hold/sell ratings.""",
                   "tools": available_tools
               }

               # Sentiment Analyst Agent
               sentiment_analyst = {
                   "name": "sentiment_analyst",
                   "instructions": """You analyze market sentiment from news.

                   Use available tools to:
                   - Get recent company news
                   - Assess sentiment (positive/negative/neutral)
                   - Identify significant developments
                   - Gauge market reaction

                   Provide sentiment summary impacting stock.""",
                   "tools": available_tools
               }

               return {
                   "session": session,
                   "agents": [
                       technical_analyst,
                       fundamental_analyst,
                       sentiment_analyst
                   ]
               }


**Step 6: Trading Coordinator**

.. code-block:: python

   async def analyze_stock(symbol: str) -> dict:
       """Coordinate multi-agent stock analysis.

       Args:
           symbol: Stock ticker

       Returns:
           Comprehensive analysis and recommendation
       """
       agent_system = await create_trading_agents()
       session = agent_system["session"]

       analyses = {}

       # Technical analysis
       tech_response = await anthropic.messages.create(
           model="claude-3-5-sonnet-20241022",
           max_tokens=2000,
           tools=[{
               "name": tool.name,
               "description": tool.description,
               "input_schema": tool.inputSchema
           } for tool in agent_system["session"].list_tools().tools],
           messages=[{
               "role": "user",
               "content": f"Perform technical analysis on {symbol}. "
                          f"Use available tools to get data and calculate indicators."
           }]
       )

       # Handle tool calls
       while tech_response.stop_reason == "tool_use":
           tool_results = []
           for block in tech_response.content:
               if block.type == "tool_use":
                   # Call MCP tool
                   result = await session.call_tool(
                       block.name,
                       arguments=block.input
                   )
                   tool_results.append({
                       "type": "tool_result",
                       "tool_use_id": block.id,
                       "content": result.content
                   })

           # Continue conversation with results
           tech_response = await anthropic.messages.create(
               model="claude-3-5-sonnet-20241022",
               max_tokens=2000,
               tools=tech_response.tools,
               messages=[
                   {"role": "user", "content": "Analyze technical indicators"},
                   {"role": "assistant", "content": tech_response.content},
                   {"role": "user", "content": tool_results}
               ]
           )

       analyses["technical"] = tech_response.content[0].text

       # Similar for fundamental and sentiment analyses...

       # Portfolio manager synthesis
       synthesis_prompt = f"""
Synthesize trading recommendation for {symbol}:

Technical Analysis: {analyses['technical']}
Fundamental Analysis: {analyses.get('fundamental', 'N/A')}
Sentiment Analysis: {analyses.get('sentiment', 'N/A')}

Provide:
- Overall recommendation (Buy/Hold/Sell)
- Confidence level (1-10)
- Position size suggestion (% of portfolio)
- Entry price target
- Stop loss level
- Key risks
"""

       final_response = await anthropic.messages.create(
           model="claude-3-5-sonnet-20241022",
           max_tokens=1000,
           messages=[{"role": "user", "content": synthesis_prompt}]
       )

       return {
           "symbol": symbol,
           "analyses": analyses,
           "recommendation": final_response.content[0].text
       }


**Step 7: Gradio Trading Dashboard**

.. code-block:: python

   import gradio as gr
   import asyncio

   def trading_interface(symbol: str):
       """Gradio interface for trading analysis."""
       result = asyncio.run(analyze_stock(symbol))

       output = f"""
## Trading Analysis: {result['symbol']}

### Technical Analysis
{result['analyses']['technical']}

### Final Recommendation
{result['recommendation']}
"""
       return output

   interface = gr.Interface(
       fn=trading_interface,
       inputs=gr.Textbox(label="Stock Symbol", placeholder="AAPL"),
       outputs=gr.Markdown(label="Analysis Report"),
       title="📈 Trading Floor: Multi-Agent Analysis",
       description="Autonomous trading analysis powered by MCP and multi-agent collaboration",
       examples=[["AAPL"], ["TSLA"], ["MSFT"], ["GOOGL"]]
   )

   interface.launch()


**Step 8: Safety Mechanisms**

.. code-block:: python

   class RiskManager:
       """Trading risk management."""

       def __init__(self, max_position_pct: float = 0.1):
           self.max_position_pct = max_position_pct
           self.positions = {}

       def validate_trade(
           self,
           symbol: str,
           action: str,
           quantity: int,
           price: float,
           portfolio_value: float
       ) -> tuple[bool, str]:
           """Validate trade against risk limits.

           Returns:
               (approved, reason)
           """
           trade_value = quantity * price
           position_pct = trade_value / portfolio_value

           # Position size check
           if position_pct > self.max_position_pct:
               return False, f"Position exceeds {self.max_position_pct*100}% limit"

           # Diversification check
           if len(self.positions) < 10 and symbol not in self.positions:
               if position_pct > 0.05:
                   return False, "Concentrate portfolio risk - max 5% for new positions"

           return True, "Trade approved"


Commercial Applications
-----------------------

**Algorithmic Trading:** Systematic strategy execution

**Wealth Management:** Portfolio optimization and rebalancing

**Research Platforms:** Multi-factor analysis automation

**Risk Management:** Real-time position monitoring

**Market Making:** Liquidity provision algorithms


Deployment Considerations
--------------------------

**Paper Trading First:**
- Test all strategies with simulated execution
- Validate risk management
- Monitor for edge cases

**Production Safety:**
- Position limits and circuit breakers
- Human approval for large trades
- Comprehensive logging and monitoring
- Regular strategy reviews

**Cost Management:**
- MCP tool caching (reduce API calls)
- Batch analysis where possible
- Tier API subscriptions appropriately


Lesson to Remember
------------------

The Trading Floor synthesizes six weeks of agentic AI development into production system. Every pattern encountered appears here: multi-agent collaboration, specialized tools, stateful workflows, safety mechanisms, real-world API integration, commercial deployment concerns.

Model Context Protocol (MCP) provides the unifying standard—tools built once, accessible universally across frameworks and clients. This architecture scales: build MCP servers for domains (finance, healthcare, legal), agents access capabilities uniformly, systems evolve by adding servers not rewriting integrations.

The project demonstrates AI agents' current capabilities: excellent at data processing, pattern recognition, systematic analysis, tireless monitoring. Also their limitations: require human oversight for high-stakes decisions, need safety mechanisms preventing errors, demand continuous validation ensuring reliable operation.

More profoundly, the trading floor reveals agentic AI's commercial viability—not replacing human expertise but augmenting it systematically. Agents handle data processing, routine analysis, pattern identification. Humans provide strategy, risk tolerance, judgment. This collaboration unlocks value: systematic execution maintaining human oversight.

The future of professional services likely follows this pattern: AI handling routine cognitive work, humans focusing on judgment, creativity, client relationships. Trading floors today, law firms tomorrow, hospitals eventually—wherever systematic analysis combines with human judgment.


Resources & Further Learning
-----------------------------

**Project Code:**
- GitHub: https://github.com/ed-donner/agents/tree/main/week-6-mcp/trading-floor

**MCP Resources:**
- MCP Specification: https://spec.modelcontextprotocol.io
- MCP Servers Marketplace: https://github.com/modelcontextprotocol/servers
- Building MCP Servers: https://modelcontextprotocol.io/docs/

**Financial APIs:**
- Polygon.io: https://polygon.io (Market data)
- Alpha Vantage: https://www.alphavantage.co (Alternative market data)
- Financial Modeling Prep: https://financialmodelingprep.com (Fundamentals)

**Related Projects:**
- All previous course projects integrate here
- Stock Picker (Week 3): Fundamental analysis patterns
- Deep Research (Week 2): Multi-source synthesis

**Deployment:**
- Hugging Face Spaces: Gradio interface hosting
- Railway/Render: MCP server deployment
- AWS/GCP: Production infrastructure

---

*IMPORTANT: Educational project demonstrating agentic architecture. Not financial advice. Real trading requires licenses, compliance, extensive testing. Consult financial professionals before deploying trading systems.*

