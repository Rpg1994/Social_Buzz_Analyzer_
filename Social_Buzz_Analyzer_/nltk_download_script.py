import nltk
import logging

try:
    nltk.download('vader_lexicon')
    print("NLTK vader_lexicon successfully downloaded.")
except Exception as e:
    print("Error downloading NLTK data: ", e)
    logging.error("Error downloading NLTK vader_lexicon: %s", e, exc_info=True)