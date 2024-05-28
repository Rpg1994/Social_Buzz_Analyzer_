import pandas as pd
import numpy as np
from scipy.stats import zscore
from sklearn.ensemble import IsolationForest
import json
import sys

# Function to detect anomalies using Isolation Forest
def detect_anomalies_with_isolation_forest(data):
    model = IsolationForest(contamination=0.05)
    predictions = model.fit_predict(data)
    return predictions

# Load data from stdin
data = json.load(sys.stdin)

# Convert data to DataFrame
df = pd.DataFrame(data)

# Calculate Z-scores for mentions, likes, shares, and retweets
z_scores = np.abs(zscore(df[['mentionCount', 'likes', 'shares', 'retweets']]))

# Define a threshold for anomalies
threshold = 3

# Identify rows where any column has a Z-score above the threshold
anomalies_zscore = (z_scores > threshold).any(axis=1)

# Apply Isolation Forest to detect anomalies
anomalies_isolation_forest = detect_anomalies_with_isolation_forest(df[['mentionCount', 'likes', 'shares', 'retweets']]) == -1

# Combine both methods for a comprehensive anomaly detection
df['anomaly'] = anomalies_zscore | anomalies_isolation_forest

# Output the rows with anomalies
print(df[df['anomaly']].to_json(orient="records"))