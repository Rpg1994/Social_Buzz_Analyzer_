import requests
from bs4 import BeautifulSoup
import json
import sys
import logging

def scrape_reddit(cryptoTicker):
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = f"https://www.reddit.com/r/CryptoCurrency/search?q={cryptoTicker}&restrict_sr=1"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            posts = soup.find_all('div', {'class': 'Post'})
            data = []
            for post in posts:
                title = post.find('h3')
                upvotes = post.find('div', {'class': '_1rZYMD_4xY3gRcSS3p8ODO'})
                # Hypothetical selectors for subreddit followers
                followers = 'SubredditSubscribersCount'  # Placeholder for actual implementation
                engagement_rate = upvotes.text if upvotes else '0'
                
                if title and upvotes:
                    item = {
                        'title': title.text,
                        'upvotes': upvotes.text,
                        'followers': followers,
                        'engagement_rate': engagement_rate,
                    }
                    data.append(item)
            print(json.dumps(data))
        else:
            logging.error(f"Failed to retrieve data from Reddit. Status code: {response.status_code}")
    except Exception as e:
        logging.error("An error occurred while scraping Reddit:", exc_info=True)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cryptoTicker = sys.argv[1]
    else:
        logging.error("No crypto ticker provided. Usage: python redditScraper.py <cryptoTicker>")
        sys.exit(1)
    scrape_reddit(cryptoTicker)