import json
import sys

def calculate_influence_score(post_details):
    try:
        followers = post_details.get('followers', 0)
        engagement_rate = post_details.get('engagement_rate', 0)
        other_metrics = post_details.get('other_metrics', 0)

        # Calculate the influence score based on provided weights
        influence_score = (0.4 * followers) + (0.4 * engagement_rate) + (0.2 * other_metrics)
        return influence_score
    except Exception as e:
        print(f"Error calculating influence score: {str(e)}", file=sys.stderr)
        return None

def main():
    input_data = sys.stdin.read()
    try:
        posts = json.loads(input_data)
    except json.JSONDecodeError as e:
        print(f"Invalid input format: {str(e)}", file=sys.stderr)
        sys.exit(1)

    for post in posts:
        if not isinstance(post, dict):
            print("Invalid post data format; each post must be a dictionary.", file=sys.stderr)
            continue

        post['influence_score'] = calculate_influence_score(post)

    print(json.dumps(posts))

if __name__ == "__main__":
    main()