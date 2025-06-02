import csv
from collections import defaultdict
from typing import List, Dict, Tuple
import os
from ..models.contact import Contact

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build the path to the CSV file
WEIGHTER_CSV_PATH = os.path.join(BASE_DIR, '..', 'Knowledgebase', 'Weighter.csv')
WEIGHTER_CSV_PATH = os.path.abspath(WEIGHTER_CSV_PATH)

# Load tag weights from CSV
tag_weights: Dict[str, Tuple[str, float]] = {}
try:
    with open(WEIGHTER_CSV_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        # Print headers for debugging
        print("CSV Headers:", reader.fieldnames)
        
        # Map column names (case-insensitive)
        tag_col = next((col for col in reader.fieldnames if col.lower() == 'tag'), None)
        bucket_col = next((col for col in reader.fieldnames if 'personality' in col.lower() and 'bucket' in col.lower()), None)
        weight_col = next((col for col in reader.fieldnames if col.lower() == 'weight'), None)
        
        if not all([tag_col, bucket_col, weight_col]):
            raise ValueError(f"Missing required columns. Found: {reader.fieldnames}")
        
        for row in reader:
            tag = row[tag_col].strip()
            bucket = row[bucket_col].strip()
            try:
                weight = float(row[weight_col])
            except (ValueError, TypeError):
                weight = 1.0  # Default weight if conversion fails
            tag_weights[tag] = (bucket, weight)
except Exception as e:
    print(f"Error loading Weighter.csv: {str(e)}")
    print(f"File path: {WEIGHTER_CSV_PATH}")
    raise

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
        if tag_key in tag_weights:
            bucket, weight = tag_weights[tag_key]
            if bucket and bucket not in ["To Be Classified", "", None]:
                scores[bucket] += weight
    if not scores:
        # Assign to unplaceable bucket based on main bucket
        if main_bucket == 'Health':
            return UNPLACEABLE_HEALTH
        elif main_bucket == 'Business Operations':
            return UNPLACEABLE_BUSINESS
        elif main_bucket == 'Survivalist':
            return UNPLACEABLE_SURVIVALIST
        else:
            return CANNOT_PLACE
    # Return the bucket with the highest score
    return max(scores, key=scores.get)


def assign_buckets(tags: List[str]) -> Tuple[str, str]:
    main_bucket = score_main_bucket(tags)
    personality_bucket = assign_personality_bucket(tags, main_bucket)
    return main_bucket, personality_bucket 