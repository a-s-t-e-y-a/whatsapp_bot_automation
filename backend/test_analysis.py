import asyncio
import os
from dotenv import load_dotenv
from src.integration.github_client import GitHubClient
from src.agents.commit_analysis_agent import get_commit_analysis_agent
from src.agents.tools.analysis_tools import (
    extract_file_changes,
    categorize_change_type,
    calculate_impact_score,
    identify_technologies
)

load_dotenv()

async def test_github_client():
    client = GitHubClient()
    
    repo_url = "https://github.com/octocat/Hello-World"
    commit_sha = "7fd1a60b01f91b314f59955a4e4d4e80d8edf11d"
    
    try:
        commit_details = await client.get_commit_details(repo_url, commit_sha)
        print("✅ GitHub API - Commit Details:")
        print(f"   Message: {commit_details['commit']['message']}")
        print(f"   Author: {commit_details['commit']['author']['name']}")
        print(f"   Files changed: {len(commit_details['files'])}")
        
        diff = await client.get_commit_diff(repo_url, commit_sha)
        print(f"\n✅ GitHub API - Diff fetched: {len(diff)} characters")
        
        return diff, commit_details
    except Exception as e:
        print(f"❌ GitHub API Error: {e}")
        return None, None

async def test_analysis_tools(diff):
    if not diff:
        print("⏭️  Skipping analysis tools test (no diff)")
        return
    
    print("\n✅ Analysis Tools:")
    
    files = extract_file_changes(diff)
    print(f"   Files extracted: {len(files)}")
    for f in files[:3]:
        print(f"     - {f['filename']} (+{f['lines_added']} -{f['lines_removed']})")
    
    change_type = categorize_change_type("feat: add new feature", diff)
    print(f"   Change type: {change_type}")
    
    impact = calculate_impact_score(diff)
    print(f"   Impact score: {impact}/10")
    
    techs = identify_technologies(diff)
    print(f"   Technologies: {', '.join(techs) if techs else 'None detected'}")

async def test_analysis_agent():
    print("\n✅ Analysis Agent:")
    
    agent = get_commit_analysis_agent()
    print("   Agent initialized successfully")
    print(f"   Model: {os.getenv('ANALYSIS_MODEL', 'openai/gpt-4o')}")
    print(f"   Temperature: {os.getenv('ANALYSIS_TEMPERATURE', '0.3')}")

async def main():
    print("=" * 60)
    print("COMMIT ANALYSIS SYSTEM - VERIFICATION TEST")
    print("=" * 60)
    
    print("\n1. Testing GitHub API Client...")
    diff, commit_details = await test_github_client()
    
    print("\n2. Testing Analysis Tools...")
    await test_analysis_tools(diff)
    
    print("\n3. Testing Analysis Agent...")
    await test_analysis_agent()
    
    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETE")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Add your GitHub token to .env: GITHUB_API_TOKEN=ghp_xxx")
    print("2. Add your OpenRouter key to .env: OPENROUTER_API_KEY=sk-or-xxx")
    print("3. Test with a real webhook from your repository")
    print("4. Monitor the commits collection for analysis results")

if __name__ == "__main__":
    asyncio.run(main())
