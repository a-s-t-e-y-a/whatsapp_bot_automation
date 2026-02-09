import re
from typing import Dict, List, Any

def extract_file_changes(diff: str) -> List[Dict[str, Any]]:
    """Extract file changes from a git diff, including filenames and line counts."""
    files = []
    current_file = None
    lines_added = 0
    lines_removed = 0
    
    for line in diff.split('\n'):
        if line.startswith('diff --git'):
            if current_file:
                current_file['lines_added'] = lines_added
                current_file['lines_removed'] = lines_removed
                files.append(current_file)
            
            match = re.search(r'b/(.+)$', line)
            if match:
                current_file = {
                    'filename': match.group(1),
                    'lines_added': 0,
                    'lines_removed': 0
                }
                lines_added = 0
                lines_removed = 0
        
        elif line.startswith('+') and not line.startswith('+++'):
            lines_added += 1
        elif line.startswith('-') and not line.startswith('---'):
            lines_removed += 1
    
    if current_file:
        current_file['lines_added'] = lines_added
        current_file['lines_removed'] = lines_removed
        files.append(current_file)
    
    return files

def categorize_change_type(message: str, diff: str) -> str:
    """Categorize commit type based on message and diff content."""
    message_lower = message.lower()
    
    keywords = {
        'feature': ['feat', 'feature', 'add', 'implement', 'new'],
        'bugfix': ['fix', 'bug', 'patch', 'resolve', 'correct'],
        'refactor': ['refactor', 'restructure', 'reorganize', 'cleanup'],
        'docs': ['doc', 'documentation', 'readme', 'comment'],
        'test': ['test', 'spec', 'testing'],
        'chore': ['chore', 'update', 'bump', 'dependency', 'deps']
    }
    
    for change_type, words in keywords.items():
        if any(word in message_lower for word in words):
            return change_type
    
    return 'chore'

def calculate_impact_score(diff: str) -> int:
    """Calculate impact score (1-10) based on number of files and lines changed."""
    files = extract_file_changes(diff)
    total_lines = sum(f['lines_added'] + f['lines_removed'] for f in files)
    num_files = len(files)
    
    if total_lines < 10 and num_files <= 1:
        return 2
    elif total_lines < 50 and num_files <= 3:
        return 4
    elif total_lines < 200 and num_files <= 5:
        return 6
    elif total_lines < 500 and num_files <= 10:
        return 8
    else:
        return 10

def identify_technologies(diff: str) -> List[str]:
    """Identify programming languages and technologies used in the diff."""
    tech_patterns = {
        'python': [r'\.py$', r'import\s+', r'from\s+\w+\s+import'],
        'javascript': [r'\.js$', r'\.jsx$', r'const\s+', r'let\s+', r'function\s+'],
        'typescript': [r'\.ts$', r'\.tsx$', r'interface\s+', r'type\s+'],
        'html': [r'\.html$', r'<\w+>'],
        'css': [r'\.css$', r'\.scss$', r'\{[\s\S]*?\}'],
        'sql': [r'\.sql$', r'SELECT\s+', r'INSERT\s+', r'UPDATE\s+'],
        'docker': [r'Dockerfile', r'docker-compose'],
        'yaml': [r'\.yml$', r'\.yaml$'],
        'json': [r'\.json$'],
        'markdown': [r'\.md$']
    }
    
    technologies = []
    for tech, patterns in tech_patterns.items():
        for pattern in patterns:
            if re.search(pattern, diff, re.IGNORECASE):
                technologies.append(tech)
                break
    
    return list(set(technologies))

def extract_modified_functions(diff: str) -> List[str]:
    """Extract names of functions that were modified in the diff."""
    functions = []
    
    patterns = [
        r'def\s+(\w+)\s*\(',
        r'function\s+(\w+)\s*\(',
        r'const\s+(\w+)\s*=\s*\(',
        r'async\s+function\s+(\w+)\s*\(',
    ]
    
    for line in diff.split('\n'):
        if line.startswith('+') or line.startswith('-'):
            for pattern in patterns:
                match = re.search(pattern, line)
                if match:
                    functions.append(match.group(1))
    
    return list(set(functions))
