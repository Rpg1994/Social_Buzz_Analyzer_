import sys
import json
from datetime import datetime
from nltk.sentiment import SentimentIntensityAnalyzer
import logging

def analyze_sentiment(data):
    sia = SentimentIntensityAnalyzer()
    for mention in data:
        try:
            score = sia.polarity_scores(mention['text'])
            compound_score = score['compound']
            if compound_score >= 0.05:
                sentiment = 'positive'
            elif compound_score <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            mention['sentiment'] = sentiment
            # Include a timestamp for each sentiment analysis result
            mention['analysisTimestamp'] = datetime.now().isoformat()
        except Exception as e:
            logging.error("Error analyzing sentiment for mention: %s", e, exc_info=True)
    return data

if __name__ == '__main__':
    try:
        input_data = json.load(sys.stdin)
        enhanced_data = analyze_sentiment(input_data)
        print(json.dumps(enhanced_data))
    except Exception as e:
        logging.error("Error processing input data for sentiment analysis: %s", e, exc_info=True)