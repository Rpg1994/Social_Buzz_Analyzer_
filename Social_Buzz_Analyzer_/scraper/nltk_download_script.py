import nltk
import logging

try:
    nltk.download('vader_lexicon')
    nltk.download('punkt')  # Add this line if tokenization is needed
    # Add any other nltk downloads here
    print("NLTK data successfully downloaded.")
except Exception as e:
    print("Error downloading NLTK data: ", e)
    logging.error("Error downloading NLTK vader_lexicon: %s", e, exc_info=True)