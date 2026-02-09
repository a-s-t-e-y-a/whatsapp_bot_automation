import os
from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver
from src.agents.tools.analysis_tools import (
    extract_file_changes,
    categorize_change_type,
    calculate_impact_score,
    identify_technologies,
    extract_modified_functions
)

COMMIT_ANALYSIS_INSTRUCTIONS = """You are a senior software engineer analyzing Git commits.

Your task is to analyze commit messages and code diffs to provide structured insights about code changes.

For each commit, you will receive:
1. Commit message
2. Full diff of changes
3. Metadata (author, timestamp, files changed)

You must analyze and provide:

1. **Change Type Classification**: Categorize as one of:
   - feature: New functionality or capabilities
   - bugfix: Bug fixes or corrections
   - refactor: Code restructuring without changing behavior
   - docs: Documentation changes
   - test: Test additions or modifications
   - chore: Maintenance tasks, dependency updates

2. **Summary**: One-line description of what changed (max 100 chars)

3. **Detailed Analysis**: Comprehensive explanation including:
   - What was changed and why
   - Technical implementation details
   - Impact on the codebase
   - Any architectural decisions

4. **Key Changes**: List of 3-5 most important modifications

5. **Potential Issues**: Any concerns, risks, or areas needing attention

6. **Impact Score**: Rate 1-10 based on:
   - Number of files changed
   - Lines of code modified
   - Complexity of changes
   - Scope of impact

Always be:
- Technical and precise
- Concise but comprehensive
- Focused on actionable insights
- Objective in assessment

Use the provided tools to extract technical details from the diff.
"""

def get_commit_analysis_agent():
    checkpointer = MemorySaver()
    
    model = ChatOpenAI(
        model=os.getenv("ANALYSIS_MODEL", "openai/gpt-4o"),
        temperature=float(os.getenv("ANALYSIS_TEMPERATURE", "0.3")),
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1"
    )
    
    return create_deep_agent(
        model=model,
        tools=[
            extract_file_changes,
            categorize_change_type,
            calculate_impact_score,
            identify_technologies,
            extract_modified_functions
        ],
        system_prompt=COMMIT_ANALYSIS_INSTRUCTIONS,
        checkpointer=checkpointer
    )
