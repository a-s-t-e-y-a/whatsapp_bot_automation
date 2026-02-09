from datetime import datetime
from src.integration.commits import CommitDAO
from src.agents.report_aggregation_agent import get_report_aggregation_agent
from src.services.notification_service import NotificationService
from typing import Dict, Any, List
import json

class ReportService:
    def __init__(self):
        self.commit_dao = CommitDAO()
        self.agent = get_report_aggregation_agent()
        self.notification_service = NotificationService()

    async def generate_and_send_daily_report(self, repo_url: str, repo_name: str, target: str = "google") -> Dict[str, Any]:
        # 1. Fetch today's commits
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        commits = await self.commit_dao.get_by_repository(repo_url, date_str=date_str, limit=50)
        
        if not commits:
            return {
                "success": False,
                "message": f"No commits found for {repo_name} on {date_str}"
            }

        # 2. Prepare data for the agent
        commit_data_for_ai = []
        for c in commits:
            commit_data_for_ai.append({
                "summary": c.get("summary", ""),
                "change_type": c.get("change_type", ""),
                "key_changes": c.get("key_changes", []),
                "potential_issues": c.get("potential_issues", []),
                "impact_score": c.get("impact_score", 0)
            })

        # 3. Invoke the aggregation agent
        prompt = f"Here are the analyzed commits for {repo_name} today ({date_str}):\n\n{json.dumps(commit_data_for_ai, indent=2)}"
        
        config = {"configurable": {"thread_id": f"report_{repo_name}_{date_str}"}}
        response = await self.agent.ainvoke(
            {"messages": [{"role": "user", "content": prompt}]},
            config
        )
        
        report_text = response["messages"][-1].content

        # 4. Send the report to the specified target
        send_success = await self.notification_service.send_report(repo_name, report_text, target=target)
        
        return {
            "success": send_success,
            "report": report_text,
            "commit_count": len(commits)
        }
