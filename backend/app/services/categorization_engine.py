from typing import List, Dict, Tuple

# Placeholder weighted keyword lists for Main Buckets
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

PERSONALITY_BUCKET_KEYWORDS = {
    'Digital Marketing & Content Creation Skills': [
        {'keyword': 'marketing', 'weight': 1},
        {'keyword': 'content', 'weight': 1},
    ],
    'Entrepreneurship & Business Development': [
        {'keyword': 'entrepreneur', 'weight': 1},
        {'keyword': 'business development', 'weight': 1},
    ],
    'Fitness, Nutrition & Weight Management': [
        {'keyword': 'fitness', 'weight': 1},
        {'keyword': 'nutrition', 'weight': 1},
    ],
    'Holistic Wellness & Natural Living': [
        {'keyword': 'holistic', 'weight': 1},
        {'keyword': 'natural', 'weight': 1},
    ],
    'Investing, Finance & Wealth Creation': [
        {'keyword': 'invest', 'weight': 1},
        {'keyword': 'finance', 'weight': 1},
    ],
    'Longevity & Regenerative Health': [
        {'keyword': 'longevity', 'weight': 1},
        {'keyword': 'regenerative', 'weight': 1},
    ],
    'Mental & Emotional Well-being': [
        {'keyword': 'mental', 'weight': 1},
        {'keyword': 'emotional', 'weight': 1},
    ],
    'Self-Reliance & Preparedness': [
        {'keyword': 'self-reliance', 'weight': 1},
        {'keyword': 'preparedness', 'weight': 1},
    ],
    'Targeted Health Solutions & Disease Management': [
        {'keyword': 'disease', 'weight': 1},
        {'keyword': 'management', 'weight': 1},
    ],
    "Women's Health & Community": [
        {'keyword': 'women', 'weight': 1},
        {'keyword': 'community', 'weight': 1},
    ],
}

DEFAULT_MAIN_BUCKET = 'Business Operations'
DEFAULT_PERSONALITY_BUCKET = 'Entrepreneurship & Business Development'
CANNOT_PLACE = 'Cannot Place'

def score_buckets(tags: List[str], bucket_keywords: Dict[str, List[Dict]]) -> Dict[str, int]:
    scores = {bucket: 0 for bucket in bucket_keywords}
    for tag in tags:
        tag_lower = tag.lower()
        for bucket, keywords in bucket_keywords.items():
            for kw in keywords:
                if kw['keyword'] in tag_lower:
                    scores[bucket] += kw['weight']
    return scores

def assign_buckets(tags: List[str]) -> Tuple[str, str]:
    # Main Bucket
    main_scores = score_buckets(tags, MAIN_BUCKET_KEYWORDS)
    max_main_score = max(main_scores.values())
    if max_main_score == 0:
        main_bucket = CANNOT_PLACE if not tags else DEFAULT_MAIN_BUCKET
    else:
        # Tie-breaking: pick the first bucket with the max score
        main_bucket = [b for b, s in main_scores.items() if s == max_main_score][0]

    # Personality Bucket
    personality_scores = score_buckets(tags, PERSONALITY_BUCKET_KEYWORDS)
    max_personality_score = max(personality_scores.values())
    if max_personality_score == 0:
        personality_bucket = CANNOT_PLACE if not tags else DEFAULT_PERSONALITY_BUCKET
    else:
        personality_bucket = [b for b, s in personality_scores.items() if s == max_personality_score][0]

    return main_bucket, personality_bucket 