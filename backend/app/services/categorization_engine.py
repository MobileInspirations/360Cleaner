import os
import csv
from collections import defaultdict
from typing import List, Dict, Tuple
from ..models.contact import Contact

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build the path to the new categorization CSV file
CATEGORIZATION_CSV_PATH = os.path.join(BASE_DIR, '..', 'Knowledgebase', 'tagsandsummitsandbuckets.csv')
CATEGORIZATION_CSV_PATH = os.path.abspath(CATEGORIZATION_CSV_PATH)

# Load tag to personality bucket mapping from CSV
tag_to_personality_bucket: Dict[str, str] = {}
with open(CATEGORIZATION_CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        tag = (row.get('Tag') or '').strip().lower()
        personality_bucket = (row.get('Personality_Bucket') or '').strip()
        if tag and personality_bucket:
            tag_to_personality_bucket[tag] = personality_bucket

# Main bucket logic (can be extended to use a similar CSV if needed)
MAIN_BUCKET_KEYWORDS = {
    'Business Operations': [
        {'keyword': 'business', 'weight': 1},
        {'keyword': 'operations', 'weight': 1},
        {'keyword': 'leadership', 'weight': 1},
    ],
    'Health': [
        {'keyword': 'health', 'weight': 1},
        {'keyword': 'wellness', 'weight': 1},
        {'keyword': 'medical', 'weight': 1},
    ],
    'Survivalist': [
        {'keyword': 'survival', 'weight': 1},
        {'keyword': 'emergency', 'weight': 1},
        {'keyword': 'preparedness', 'weight': 1},
    ],
}

DEFAULT_MAIN_BUCKET = 'Business Operations'
DEFAULT_PERSONALITY_BUCKET = 'Entrepreneurship & Business Development'
CANNOT_PLACE = 'Cannot Place'
UNPLACEABLE_HEALTH = 'Unplaceable Health'
UNPLACEABLE_BUSINESS = 'Unplaceable Business'
UNPLACEABLE_SURVIVALIST = 'Unplaceable Survivalist'
NED_HEALTH = 'NED Health'
NED_BUSINESS = 'NED Business'
NED_SURVIVALIST = 'NED Survivalist'


def score_main_bucket(tags: List[str]) -> str:
    scores = {bucket: 0 for bucket in MAIN_BUCKET_KEYWORDS}
    for tag in tags:
        tag_lower = tag.lower()
        for bucket, keywords in MAIN_BUCKET_KEYWORDS.items():
            for kw in keywords:
                if kw['keyword'] in tag_lower:
                    scores[bucket] += kw['weight']
    max_score = max(scores.values())
    if max_score == 0:
        return DEFAULT_MAIN_BUCKET if tags else CANNOT_PLACE
    # Tie-breaking: pick the first bucket with the max score
    return [b for b, s in scores.items() if s == max_score][0]


def assign_personality_bucket(tags: List[str], main_bucket: str) -> str:
    scores = defaultdict(int)
    for tag in tags:
        tag_key = tag.strip().lower()
        bucket = tag_to_personality_bucket.get(tag_key)
        if bucket and bucket not in ["To Be Classified", "", None]:
            scores[bucket] += 1  # 1 point per matching tag
    if not scores:
        # Assign to NED bucket based on main bucket
        if main_bucket == 'Health':
            return NED_HEALTH
        elif main_bucket == 'Business Operations':
            return NED_BUSINESS
        elif main_bucket == 'Survivalist':
            return NED_SURVIVALIST
        else:
            return CANNOT_PLACE
    # Return the bucket with the highest score
    max_score = max(scores.values())
    top_buckets = [b for b, s in scores.items() if s == max_score]
    return sorted(top_buckets)[0]  # Tie-breaker: alphabetical


def assign_buckets(tags: List[str]) -> Tuple[str, str]:
    main_bucket = score_main_bucket(tags)
    personality_bucket = assign_personality_bucket(tags, main_bucket)
    return main_bucket, personality_bucket 