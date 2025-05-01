import tweepy
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Twitter API credentials
API_KEY = os.getenv('IVkf2L8QlgRVoMosaOUv3DBhx')
API_KEY_SECRET = os.getenv('2RHEJ2Dh05caFtgZ1qm240mNCeCTXzSqaMXvn2HhFeBUCMdYA4')
ACCESS_TOKEN = os.getenv('1902064516613222400-zAFvn67kkytPNdvxTmyONv89uyVpkH')
ACCESS_TOKEN_SECRET = os.getenv('RHk7OTHyVG1lH1QFgFYV11cEhw3rFajg3wbs5NeIdYOas')

# Authentication
def authenticate_twitter():
    try:
        auth = tweepy.OAuth1UserHandler(API_KEY, API_KEY_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        api = tweepy.API(auth)
        print("Authentication successful!")
        return api
    except Exception as e:
        print(f"Error during authentication: {e}")
        return None

# Search for tweets
def search_tweets(api, query, count=10):
    """
    Search for tweets matching the query and extract relevant information.

    :param api: Authenticated Twitter API object
    :param query: The search query
    :param count: Number of tweets to retrieve
    :return: List of dictionaries containing tweet details
    """
    results = []
    
    try:
        # Search for tweets
        tweets = api.search_tweets(q=query, count=count, tweet_mode='extended')
        
        # Extract tweet details
        for tweet in tweets:
            tweet_details = {
                'text': tweet.full_text,
                'author': tweet.user.screen_name,
                'created_at': tweet.created_at,
                'retweets': tweet.retweet_count,
                'likes': tweet.favorite_count,
                'tweet_id': tweet.id,
                'user_followers': tweet.user.followers_count
            }
            results.append(tweet_details)
    except Exception as e:
        print(f"Error during tweet search: {e}")
    
    return results

if __name__ == '__main__':
    # Authenticate with Twitter
    api = authenticate_twitter()
    
    if api:
        
        query = 'Python Programming'
        count = 5  # Number of tweets to retrieve
        
        
        tweets = search_tweets(api, query, count)
        
       
        for i, tweet in enumerate(tweets, 1):
            print(f"Tweet {i}:")
            print(f"Author: @{tweet['author']}")
            print(f"Created At: {tweet['created_at']}")
            print(f"Text: {tweet['text']}")
            print(f"Retweets: {tweet['retweets']}")
            print(f"Likes: {tweet['likes']}")
            print(f"Tweet ID: {tweet['tweet_id']}")
            print(f"User Followers: {tweet['user_followers']}")
            print("-" * 80)