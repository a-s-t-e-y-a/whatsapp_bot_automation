import asyncio
import httpx
import json
import random
import string

async def test_webhook():
    # Generate a random SHA for every test run
    random_sha = ''.join(random.choices(string.hexdigits.lower(), k=40))
    
    webhook_payload = {
        "repository": {
            "html_url": "https://github.com/octocat/Hello-World"
        },
        "commits": [
            {
                "id": random_sha,
                "message": f"feat: test commit {random_sha[:8]}",
                "author": {
                    "username": "octocat"
                },
                "timestamp": "2024-02-09T12:00:00Z",
                "url": "https://github.com/octocat/Hello-World/commit/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d",
                "added": [],
                "modified": ["README.md"],
                "removed": []
            }
        ]
    }
    
    url = "http://localhost:8000/api/webhooks/github"
    headers = {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": "sha256=dummy_signature"
    }
    
    print("🧪 Testing webhook endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(webhook_payload, indent=2)}")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=webhook_payload, headers=headers)
            print(f"\n✅ Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("WEBHOOK TEST SCRIPT")
    print("=" * 60)
    print("\nPrerequisites:")
    print("1. Server running on http://localhost:8000")
    print("2. OPENROUTER_API_KEY set in .env")
    print("3. GitHub token stored in database")
    print("4. Repository registered in database")
    print("\n" + "=" * 60 + "\n")
    
    asyncio.run(test_webhook())
