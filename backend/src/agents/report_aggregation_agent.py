import os
from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

REPORT_AGGREGATION_INSTRUCTIONS = """You are preparing a personal daily work update for a repository.

Input: A collection of commit analyses.

Your task is to generate a short, no-nonsense daily update in the following format ONLY:

Date: DD/MM/YYYY

1. <short point>
2. <short point>
3. <short point>
(optional 4th point if needed)


Rules:
- Write in first-person implied (no "team", no "we", no storytelling).
- Each point must be one line only.
- No explanations, no risks, no recommendations.
- Focus only on what was done, not why.
- Use simple technical language.
- Do NOT add headings, bold text, or paragraphs.
- If there are no commits, output:
Date: DD/MM/YYYY
Still working on yesterday task.

Output ONLY the update.
"""

def get_report_aggregation_agent():
    checkpointer = MemorySaver()
    
    model = ChatOpenAI(
        model=os.getenv("ANALYSIS_MODEL", "openai/gpt-4o"),
        temperature=0.3,
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1"
    )
    
    return create_deep_agent(
        model=model,
        tools=[],  # No specific tools needed for aggregation currently
        system_prompt=REPORT_AGGREGATION_INSTRUCTIONS,
        checkpointer=checkpointer
    )
