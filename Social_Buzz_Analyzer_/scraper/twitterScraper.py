import json
import sys
from scrapy import Spider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.log import configure_logging
import logging

class TwitterScraper(Spider):
    name = "twitter_scraper"
    cryptoTicker = sys.argv[1] if len(sys.argv) > 1 else '#cryptocurrency'
    start_urls = [f"https://twitter.com/search?q={cryptoTicker}&src=typed_query"]

    def parse(self, response):
        try:
            tweets = response.css('div.tweet')
            data = []
            for tweet in tweets:
                # Hypothetical selectors for followers and engagement rate
                followers = tweet.css('.followers::text').get()
                engagement_rate = tweet.css('.engagement::text').get()
                
                item = {
                    'text': tweet.css('.tweet-text::text').get(),
                    'likes': tweet.css('.like::text').get(),
                    'retweets': tweet.css('.retweet::text').get(),
                    'followers': followers,
                    'engagement_rate': engagement_rate,
                }
                data.append(item)
            print(json.dumps(data))
        except Exception as e:
            logging.error("Error parsing Twitter data: %s", e, exc_info=True)

if __name__ == "__main__":
    configure_logging()
    try:
        process = CrawlerProcess()
        process.crawl(TwitterScraper)
        process.start()
    except Exception as e:
        logging.error("Error running Twitter scraper: %s", e, exc_info=True)