import os
import csv
from collections import defaultdict

# Path to the mapping CSV
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATEGORIZATION_CSV_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'Knowledgebase', 'tagsandsummitsandbuckets.csv'))

# Load tag to personality bucket mapping
_tag_to_personality_bucket = None
_tag_weight = None

def _load_tag_mapping():
    global _tag_to_personality_bucket, _tag_weight
    _tag_to_personality_bucket = {}
    _tag_weight = {}
    with open(CATEGORIZATION_CSV_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            email = row.get('Email', '').strip()
            tag = (row.get('Tag') or '').strip().lower()
            personality_bucket = (row.get('Personality_Bucket') or '').strip()
            weight = row.get('Weight')
            try:
                weight = int(weight)
            except (TypeError, ValueError):
                weight = 1
            engagement_level = row.get('Engagement') or row.get('Engagement Level')
            email_state = row.get('Email State')
            email_sub_state = row.get('Email Sub-State')
            if tag and personality_bucket:
                _tag_to_personality_bucket[tag] = personality_bucket
                _tag_weight[tag] = weight

# Assign personality bucket based on tags and main bucket
# Usage: assign_buckets(tags: list, main_bucket: str) -> tuple
# Returns (None, personality_bucket)
def assign_buckets(tags: list, main_bucket: str = None) -> tuple:
    global _tag_to_personality_bucket, _tag_weight
    if _tag_to_personality_bucket is None:
        _load_tag_mapping()
    scores = defaultdict(int)
    tags_lower = [t.strip().lower() for t in tags]
    for tag in tags_lower:
        bucket = _tag_to_personality_bucket.get(tag)
        weight = _tag_weight.get(tag, 1)
        if bucket:
            scores[bucket] += weight
    if not scores:
        # Assign to NED bucket based on main_bucket
        if main_bucket == "Health":
            return (None, "NED Health")
        elif main_bucket == "Business Operations":
            return (None, "NED Business")
        elif main_bucket == "Survivalist":
            return (None, "NED Survivalist")
        else:
            return (None, "Cannot Place")
    max_score = max(scores.values())
    top_buckets = [b for b, s in scores.items() if s == max_score]
    return (None, sorted(top_buckets)[0])
