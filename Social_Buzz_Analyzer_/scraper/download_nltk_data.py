import nltk

try:
    nltk.download('vader_lexicon')
    print("NLTK data downloaded successfully.")
except Exception as e:
    print("An error occurred while downloading NLTK data:", e)
    print(e)