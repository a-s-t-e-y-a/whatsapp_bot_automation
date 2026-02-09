import os
import json
from typing import Dict, Any, Optional
from src.integration.github_client import GitHubClient
from src.agents.commit_analysis_agent import get_commit_analysis_agent
from src.integration.commits import CommitDAO
from src.agents.tools.analysis_tools import (
    extract_file_changes,
    categorize_change_type,
    calculate_impact_score,
    identify_technologies
)

class AnalysisService:
    def __init__(self):
        self.github_client = GitHubClient()
        self.commit_dao = CommitDAO()
        self.agent = get_commit_analysis_agent()
        self.max_diff_size = int(os.getenv("MAX_DIFF_SIZE", "50000"))
    
    async def analyze_commit(
        self, 
        commit_data: Dict[str, Any], 
        repo_url: str
    ) -> Dict[str, Any]:
        try:
            commit_sha = commit_data.get("sha")
            
            diff = await self.github_client.get_commit_diff(repo_url, commit_sha)
            
            if len(diff) > self.max_diff_size:
                diff = diff[:self.max_diff_size] + "\n... (diff truncated)"
            
            file_changes = extract_file_changes(diff)
            change_type = categorize_change_type(commit_data.get("message", ""), diff)
            impact_score = calculate_impact_score(diff)
            technologies = identify_technologies(diff)
            
            analysis_prompt = f"""Analyze this commit:

Commit Message: {commit_data.get('message')}
Author: {commit_data.get('author')}
Timestamp: {commit_data.get('timestamp')}
Files Changed: {len(file_changes)}

Diff:
{diff}

Provide a structured analysis in JSON format with the following fields:
- summary: Brief one-line summary (max 100 chars)
- details: Detailed explanation of changes
- key_changes: List of 3-5 most important modifications
- potential_issues: List of any concerns or risks (empty list if none)
"""
            
            config = {"configurable": {"thread_id": commit_sha}}
            response = await self.agent.ainvoke(
                {"messages": [{"role": "user", "content": analysis_prompt}]},
                config
            )
            
            ai_response = response["messages"][-1].content
            
            try:
                analysis_data = json.loads(ai_response)
            except json.JSONDecodeError:
                analysis_data = {
                    "summary": commit_data.get("message", "")[:100],
                    "details": ai_response,
                    "key_changes": [],
                    "potential_issues": []
                }
            
            analysis_result = {
                "hash": commit_sha,
                "message": commit_data.get("message"),
                "author": commit_data.get("author"),
                "timestamp": commit_data.get("timestamp"),
                "url": commit_data.get("url"),
                "repository": repo_url,
                "diff": diff,
                "files_changed": [f["filename"] for f in file_changes],
                "lines_added": sum(f["lines_added"] for f in file_changes),
                "lines_removed": sum(f["lines_removed"] for f in file_changes),
                "change_type": change_type,
                "summary": analysis_data.get("summary", ""),
                "details": analysis_data.get("details", ""),
                "impact_score": impact_score,
                "key_changes": analysis_data.get("key_changes", []),
                "potential_issues": analysis_data.get("potential_issues", []),
                "technologies": technologies,
                "analysis_status": "completed"
            }
            
            await self.commit_dao.save_summary(analysis_result)
            
            return analysis_result
            
        except Exception as e:
            error_result = {
                "hash": commit_data.get("sha"),
                "message": commit_data.get("message"),
                "author": commit_data.get("author"),
                "timestamp": commit_data.get("timestamp"),
                "url": commit_data.get("url"),
                "repository": repo_url,
                "analysis_status": "failed",
                "error": str(e)
            }
            
            await self.commit_dao.save_summary(error_result)
            
            return error_result
    
    async def batch_analyze_commits(
        self, 
        commits: list[Dict[str, Any]], 
        repo_url: str
    ) -> list[Dict[str, Any]]:
        results = []
        for commit in commits:
            result = await self.analyze_commit(commit, repo_url)
            results.append(result)
        return results
