# KHOJGHAR Recommendation & Search System - Complete Architecture Documentation

## Executive Summary

KHOJGHAR features a **hybrid recommendation system** combining ML-based content filtering, AI-powered suggestions, and collaborative filtering. The architecture uses two parallel recommendation engines: **ML Recommendation Service** (production) and **AI Recommendation Service** (legacy/complementary), with user interaction tracking and periodic model training via a scheduler.

---

## 1. ARCHITECTURE OVERVIEW

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                      │
│  [Search] → [View Property] → [Add Favorite] → [Contact]       │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌──────────────┐    ┌──────────────────┐
    │ ML System    │    │ AI System        │
    │ (Primary)    │    │ (Complementary)  │
    └──────────────┘    └──────────────────┘
          │                     │
          ├─► TF-IDF Vector    ├─► Search History
          ├─► K-Means Cluster  ├─► Trending Score
          ├─► Content-Based    ├─► Collaborative
          └─► Cold-Start       └─► Preference-Based
          │
          ▼
    ┌──────────────────────────────┐
    │ SCHEDULER (Every 30 mins)    │
    │ - Train Models (6 hrs)       │
    │ - Generate Recommendations  │
    │ - Update Trending Cache     │
    └──────────────────────────────┘
```

---

## 2. ML RECOMMENDATION SERVICE

**File**: `backend/services/ml-recommendation-service.js`

### 2.1 Core Algorithms

#### A. Content-Based Filtering (TF-IDF)

- **Algorithm**: Term Frequency-Inverse Document Frequency with Cosine Similarity
- **Location**: `backend/ml-recommendation/tfidf-vectorizer.js`

**How it works**:
1. Extract features from listings (title, description, amenities, location)
2. Tokenize and stem text using Natural Language Processing
3. Calculate TF-IDF scores for each term
4. Normalize vectors using L2 normalization
5. Compute cosine similarity between user preference vector and property vectors
6. Return top-N similar properties (threshold: 0.3 similarity minimum)

**Feature Extraction**:
- Text features: Title, description (tokenized & stemmed)
- Location: City, college name
- Structured: Bedrooms, bathrooms, property type, furnished status
- Amenities: Array of amenities
- Price buckets: very_low, low, medium, high, very_high

**Key Parameters**:
| Parameter | Value |
|-----------|-------|
| Max features | 500 terms |
| Min document frequency | 2 |
| IDF formula | `log((N+1)/(df+1)) + 1` |
| Similarity threshold | 0.3 (30%) |

#### B. K-Means Geo-Clustering (Cold-Start)

- **Algorithm**: K-Means with Min-Max Normalization
- **Location**: `backend/ml-recommendation/kmeans-clusterer.js`

**How it works**:
1. Normalize geographic coordinates (latitude, longitude) and rent amount
2. Initialize clusters using K-Means++ (smart initialization)
3. Assign properties to clusters based on geo-location and rent similarity
4. Calculate cluster metadata (centroid, avg rent, city)
5. Predict user's cluster based on preferences
6. Return properties from nearest cluster

**Configuration**:
| Property Count | Clusters |
|----------------|----------|
| 3-4 properties | 2 clusters |
| 5-9 properties | 2-3 clusters |
| 10+ properties | up to 10 clusters |

- **Feature Space**: [Latitude, Longitude, Normalized_Rent]
- **Normalization**: Min-Max scaling to [0,1]
- **Distance Metric**: Euclidean distance
- **Use Case**: New users with no interaction history (cold-start problem)

#### C. Fallback Preference-Based System

- **When Used**: When K-Means fails or insufficient data
- **Method**: SQL-based filtering with match percentage calculation

**Filters Applied**:
- City match (if specified)
- Rent range (minRent ≤ property.rent ≤ maxRent)
- Bedrooms (property.bedrooms ≥ preferred)
- Property type
- Amenities

**Match Scoring**: `(matched_criteria / total_criteria) × 100%`
**Minimum Threshold**: 60% match to recommend

### 2.2 User Preference Modeling

#### Profile Building (`buildUserPreferenceProfile()`)

```
User Interaction History:
├─ Searches (Last 50) → Extract city, rent, bedrooms, type, amenities
├─ Views (Last 100) → Weighted 2x higher than searches
└─ Favorites → Highest weight

Aggregation:
├─ Preferred Cities (ranked by frequency)
├─ Rent Range (min/max from searches)
├─ Average Bedrooms
├─ Preferred Property Types
└─ Preferred Amenities (top 5 by frequency)

Output:
├─ Virtual "User Preference Property" object
├─ TF-IDF Vector (computed from preference profile)
└─ Stored in user_preference_profiles table
```

### 2.3 Recommendation Generation Flow

```javascript
generateRecommendations(userId, userPreferences)
├─ Check user interaction history
├─ IF sufficient_history (≥3 interactions)
│  └─ generateContentBasedRecommendations()
│     ├─ Get user TF-IDF vector
│     ├─ Calculate cosine similarity to all properties
│     └─ Filter by min similarity (0.3) & exclude viewed
├─ ELSE IF has_saved_preferences
│  └─ fallbackPreferenceBasedRecommendations()
│     └─ SQL filtering with 60% match threshold
├─ ELSE (cold-start: new user, no history/prefs)
│  └─ generateColdStartRecommendations()
│     ├─ Predict cluster from K-Means
│     └─ Return properties from cluster (location-aware)
└─ IF all fail
   └─ Final fallback to preference-based
```

### 2.4 Scoring & Similarity

| Type | Formula | Range |
|------|---------|-------|
| Content-Based | `cosine_similarity(user_vector, property_vector)` | 0.0 - 1.0 |
| Cold-Start | `min(1 - cluster_distance, 0.75)` | 0.0 - 0.75 |
| Fallback | `matched_criteria / total_criteria` | 0.0 - 1.0 |

---

## 3. AI RECOMMENDATION SERVICE

**File**: `backend/services/ai-recommendation-service.js`

Legacy/complementary system using search history, trending analysis, and collaborative filtering.

### 3.1 Four Recommendation Algorithms

#### Algorithm 1: Search-Based (`generateSearchBasedRecommendations`)
- Queries recent searches (last 30 days, top 5)
- Reconstructs search filters
- Finds similar properties matching same criteria
- Score: 0.85 (fixed)

#### Algorithm 2: Preference-Based (`generatePreferenceBasedRecommendations`)
- Uses saved `UserSearchPreferences` (aggregated from searches)
- Filters by preferred cities, avg rent ±10% flexibility, avg bedrooms
- Score: 0.90 (fixed)

#### Algorithm 3: Trending (`generateTrendingRecommendations`)
- Sources from `trending_listings` table
- **Trending score formula**:
  ```
  trend_score = (views_last_7d × 0.5 + favorites × 1.5 + inquiries × 2) / 10
  ```
- Score: `min(0.95, trend_score/100)`

#### Algorithm 4: Collaborative Filtering (`generateCollaborativeRecommendations`)
- Find similar users based on view patterns
- If users viewed same properties, they likely have similar preferences
- Recommend properties viewed by similar users but not by current user
- Score: `min(0.92, similarity_score/10)`

### 3.2 Master Function

`generateAllRecommendations()` runs all 4 algorithms in parallel:

| Algorithm | Max Recommendations |
|-----------|---------------------|
| Search-Based | 8 |
| Preference-Based | 8 |
| Trending | 5 |
| Collaborative | 8 |
| **Total** | Up to 29 unique (deduplicated) |

---

## 4. USER INTERACTION TRACKING

### 4.1 Tracking Tables

#### `user_search_interactions` (Raw Search Tracking)

| Column | Type | Purpose |
|--------|------|---------|
| user_id | UUID | Who searched |
| search_query | text | Search text |
| city | varchar | Selected city |
| min_rent, max_rent | numeric | Budget range |
| bedrooms | int | Bedroom count |
| property_type | varchar | apartment, house, etc. |
| amenities | text[] | Selected amenities |
| furnished | varchar | fully, semi, unfurnished |
| college_name | varchar | Nearby college |
| created_at | timestamp | When searched |

#### `property_views_ml` (Engagement Tracking)

| Column | Type | Purpose |
|--------|------|---------|
| user_id | UUID | Who viewed |
| listing_id | UUID | Property viewed |
| view_duration | int | Seconds viewing |
| viewed_images | boolean | Looked at photos |
| clicked_contact | boolean | Clicked landlord contact |
| added_to_favorites | boolean | Added to favorites |
| created_at | timestamp | When viewed |

### 4.2 Tracking Flow

```
User Search Request
  ↓
trackSearch(userId, searchFilters)
  ├─ Insert into user_search_interactions
  ├─ Also insert into search_history (for UI display)
  └─ Return confirmation

User Views Property
  ↓
trackPropertyView(userId, listingId, engagement)
  ├─ Fetch property details (city, rent, bedrooms, etc.)
  ├─ Insert into property_views_ml (engagement metrics)
  ├─ Create implicit search record (based on viewed property)
  ├─ Insert into listing_views (for admin analytics)
  └─ Mark ML recommendation as clicked
```

### 4.3 Interaction Thresholds

**Sufficient History Check**: `hasSufficientHistory(userId, minInteractions=3)`
- Counts: searches + views + favorites
- Minimum: 3 total interactions to use content-based filtering
- Otherwise: Falls back to cold-start clustering

---

## 5. ML SCHEDULER

**File**: `backend/schedulers/ml-scheduler.js`

### 5.1 Schedule

| Task | Frequency | Initial Delay |
|------|-----------|---------------|
| Train Models | Every 6 hours | 5 seconds |
| Generate Recommendations | Every 30 minutes | 1 minute |

### 5.2 Training Process

```javascript
trainModels()
├─ Fetch all active listings (status='active')
├─ IF listings < 3
│  └─ WARN: Insufficient data, skip clustering
├─ Initialize TF-IDF Vectorizer
│  ├─ maxFeatures: 500
│  └─ minDocFrequency: 2
├─ Fit vectorizer on property corpus
│  ├─ Calculate document frequencies
│  ├─ Filter by document frequency bounds
│  └─ Build vocabulary (top 500 terms)
├─ Transform all properties to TF-IDF vectors
├─ Save vectors to property_feature_vectors table
├─ Initialize K-Means Clusterer
│  ├─ Determine num_clusters based on property count
│  └─ maxIterations: 100
├─ Fit K-Means model
├─ Assign cluster IDs to properties
├─ Calculate cluster metadata (centroid, avg rent, etc.)
├─ Save cluster data to geo_clusters table
└─ Return stats: {totalProperties, tfidfVectors, clusters}
```

### 5.3 Recommendation Generation

```javascript
generateRecommendations()
├─ Query active users (interactions in last 30 days)
│  └─ HAVING COUNT(*) >= 3 (minimum 3 interactions)
│  └─ LIMIT 100 users per run (batched)
├─ For each user:
│  ├─ Call mlRecommendationService.generateRecommendations()
│  ├─ Store results in ml_recommendations table
│  └─ Log success/failure
├─ Clean up old recommendations
│  └─ DELETE WHERE expires_at < NOW() AND age > 7 days
└─ Log: "{successCount} successful, {failCount} failed"
```

---

## 6. API ENDPOINTS

**File**: `backend/routes/recommendations.js`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/recommendations` | Get user's recommendations |
| POST | `/recommendations/generate` | Manually trigger generation |
| POST | `/recommendations/ml/train` | Train ML models (admin) |
| POST | `/recommendations/ml/track-search` | Record search |
| POST | `/recommendations/ml/track-view` | Record property view |
| PUT | `/recommendations/ml/update-engagement/:listingId` | Update engagement |
| POST | `/recommendations/ml/build-profile` | Build user profile |
| GET | `/recommendations/ml/stats` | Get user's recommendation stats |
| DELETE | `/recommendations/ml/clear` | Clear user's recommendations |

---

## 7. SEARCH SYSTEM

### 7.1 Main Search Endpoint

```
GET /listings/search

Query Parameters:
├─ search_query: string (required)
├─ city: string
├─ min_rent: number
├─ max_rent: number
├─ bedrooms: number
├─ bathrooms: number
├─ property_type: enum (apartment, house, etc.)
├─ amenities: string[] (array)
├─ college_name: string
├─ furnished: enum (fully, semi, unfurnished)
├─ sort_by: enum (newest, popular, price_low, price_high)
├─ page: number
└─ limit: number (default 20)
```

### 7.2 Search Processing Pipeline

1. **Query Construction**: Build dynamic SQL with applied filters
2. **Ranking Algorithm**:
   - Sort by newest (created_at DESC) by default
   - Or by popularity (view count)
   - Or by price (ascending/descending)
3. **Filters Applied**:
   - Status = 'active' AND is_verified = true
   - Subscription check: landlord must have active subscription
   - Text search on title, description, address
   - Range filters on rent, bedrooms, bathrooms
   - City/college/amenities matching
4. **Pagination**: Limit & offset
5. **Aggregation**: Add landlord info, view count, favorite count

### 7.3 Integration with ML System

**Dual Tracking**:
```
Search Request
  ├─► Execute SQL search (return results to user)
  └─► Call trackSearch() in background
      └─ Stores filters in user_search_interactions
          └ Used to build preference profile for recommendations
```

**Search Results Impact**:
- User's searches are analyzed to extract preferences
- Patterns in searches train the ML system
- Example: User searches "Kathmandu, 2BR, 15000-20000" multiple times
  → Recommendation system learns preference: City=Kathmandu, Beds=2, Budget=15K-20K

---

## 8. DATABASE SCHEMA

### 8.1 ML-Specific Tables

#### `ml_recommendations` (Core Recommendation Table)
```sql
CREATE TABLE ml_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  recommendation_type VARCHAR(50),     -- 'content_based', 'cold_start_geo', etc.
  confidence_score NUMERIC(5,4),       -- 0.0 to 1.0
  similarity_score NUMERIC(5,4),
  matching_features JSONB,             -- {city, rent, bedrooms, type}
  explanation TEXT,
  viewed BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  PRIMARY KEY (user_id, listing_id, recommendation_type)
);
```

#### `user_preference_profiles` (User ML Profile)
```sql
CREATE TABLE user_preference_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  preferred_cities TEXT[],
  preferred_min_rent NUMERIC(10,2),
  preferred_max_rent NUMERIC(10,2),
  preferred_bedrooms INTEGER,
  preferred_bathrooms INTEGER,
  preferred_property_types TEXT[],
  preferred_amenities TEXT[],
  preferred_furnished VARCHAR(50),
  preferred_colleges TEXT[],
  tfidf_vector JSONB,                  -- Serialized 500-dim vector
  total_searches INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

#### `property_feature_vectors` (Pre-computed Vectors)
```sql
CREATE TABLE property_feature_vectors (
  id UUID PRIMARY KEY,
  listing_id UUID UNIQUE NOT NULL,
  tfidf_vector JSONB NOT NULL,         -- 500-dimensional
  normalized_rent NUMERIC(5,4),
  normalized_bedrooms NUMERIC(5,4),
  normalized_bathrooms NUMERIC(5,4),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  geo_cluster_id INTEGER,
  last_computed TIMESTAMP DEFAULT NOW()
);
```

#### `geo_clusters` (K-Means Clustering Results)
```sql
CREATE TABLE geo_clusters (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER NOT NULL,
  centroid_latitude NUMERIC(10,8),
  centroid_longitude NUMERIC(11,8),
  centroid_rent NUMERIC(10,2),
  property_count INTEGER DEFAULT 0,
  avg_rent NUMERIC(10,2),
  min_rent NUMERIC(10,2),
  max_rent NUMERIC(10,2),
  primary_city VARCHAR(100),
  last_computed TIMESTAMP DEFAULT NOW()
);
```

### 8.2 Related Tables

| Table | Purpose |
|-------|---------|
| `search_history` | UI-facing search history for users |
| `user_search_preferences` | Aggregated AI preferences |
| `recommendations` | AI-generated recommendations |
| `trending_listings` | Weekly popularity cache |

---

## 9. DATA FLOW ARCHITECTURE

### 9.1 End-to-End Recommendation Flow

```
1. USER ACTION
   Search/View Property
   ↓
2. TRACKING LAYER (Synchronous)
   trackSearch() / trackPropertyView()
   ├─ Insert into user_search_interactions OR property_views_ml
   └─ Also insert into search_history (for UI)
   ↓
3. SCHEDULER LAYER (Async, Every 30 mins)
   generateRecommendations()
   ├─ FOR each active user:
   │  ├─ buildUserPreferenceProfile()
   │  │  ├─ Aggregate last 50 searches
   │  │  ├─ Aggregate last 100 views
   │  │  └─ Create virtual user preference object
   │  │
   │  ├─ IF sufficient_history (≥3 interactions)
   │  │  └─ generateContentBasedRecommendations()
   │  │     ├─ Get user TF-IDF vector
   │  │     ├─ Cosine similarity search against all property vectors
   │  │     └─ Filter by threshold (0.3) & exclude viewed
   │  │
   │  ├─ ELSE IF has_saved_preferences
   │  │  └─ fallbackPreferenceBasedRecommendations()
   │  │     └─ SQL query with filters + 60% match threshold
   │  │
   │  ├─ ELSE (cold-start)
   │  │  └─ generateColdStartRecommendations()
   │  │     ├─ Predict user's cluster using K-Means
   │  │     └─ Return properties from that cluster
   │  │
   │  └─ Save all recommendations to ml_recommendations table
   │
   └─ deleteExpired(7 days)
   ↓
4. REQUEST LAYER (On-Demand)
   GET /recommendations?algorithm=ml
   ├─ Query ml_recommendations for user (limit 20)
   ├─ Join with listings table for property details
   ├─ Apply optional location filtering (if specified)
   └─ Return to frontend with explanation text
   ↓
5. FRONTEND
   Display recommendations with:
   ├─ Confidence score (80%, 85%, etc.)
   ├─ Explanation ("85% match based on your preferences")
   └─ Property details (city, rent, bedrooms, images)
```

### 9.2 Model Training Flow (Every 6 Hours)

```
trainModels()
├─ SELECT all active listings
├─ Initialize TFIDFVectorizer
│  ├─ Fit on property corpus (extract & tokenize features)
│  ├─ Calculate TF-IDF scores for all terms
│  └─ Build vocabulary (top 500 terms)
├─ Transform each property to vector
│  └─ Save to property_feature_vectors table
├─ Initialize KMeansClusterer
│  ├─ Min-Max normalize geo+rent features
│  └─ Run K-Means algorithm
├─ Calculate cluster metadata
│  ├─ Centroid location
│  ├─ Average rent per cluster
│  ├─ Property IDs in cluster
│  └─ Primary city in cluster
├─ Save cluster data to geo_clusters table
└─ Log stats: {properties_trained, clusters_created, iterations}
```

---

## 10. ALGORITHM DEEP DIVES

### 10.1 TF-IDF Vector Creation

**Step 1: Feature Extraction**
```
Property Object:
├─ title: "Cozy 2BR apartment in Kathmandu"
├─ description: "Near Thamel, WiFi, kitchen..."
├─ bedrooms: 2
├─ bathrooms: 1
├─ city: "Kathmandu"
├─ amenities: ["WiFi", "Parking", "24/7 Water"]
└─ rent_amount: 15000

Features Array Generated:
[
  "cozy", "2br", "apartment", "kathmandu",  // from title
  "near", "thamel", "wifi", "kitchen",     // from description
  "bedrooms_2", "bathrooms_1",              // structured
  "type_apartment",
  "city_kathmandu",
  "amenity_wifi", "amenity_parking",
  "rent_medium"
]
```

**Step 2: TF-IDF Calculation**
```
For each term in vocabulary:
  TF = term_count_in_doc / total_terms_in_doc
  IDF = log((total_docs + 1) / (docs_with_term + 1)) + 1
  TF-IDF[i] = TF × IDF

Example:
  "bedrooms_2": appears in 5 docs, total 100 docs
  → IDF = log(101/6) + 1 ≈ 2.91
  → TF = 1/15 (1 occurrence, 15 total terms)
  → TF-IDF = (1/15) × 2.91 ≈ 0.194
```

**Step 3: L2 Normalization**
```
magnitude = sqrt(sum(value² for all values))
normalized_vector[i] = vector[i] / magnitude

Purpose: Convert to unit vector → cosine similarity becomes dot product
```

**Step 4: Similarity Search**
```
user_vector = [0.15, 0.22, ..., 0.18]     (500 dimensions)
property_vectors = [[0.13, 0.20, ...], ...]

cosine_similarity = dot_product(user_vector, property_vector)
                  = Σ(user[i] × property[i])

Scores: property_1: 0.85, property_2: 0.72, property_3: 0.68, ...
Return top-N where similarity > 0.3
```

### 10.2 K-Means Clustering

**Step 1: Feature Normalization**
```
Raw Features:
  latitude: 27.7172 (range ~27.6 to 27.8)
  longitude: 85.3240 (range ~85.2 to 85.4)
  rent: 15000 (range ~1000 to 50000)

Min-Max Normalization: x' = (x - min) / (max - min)
  latitude': (27.7172 - 27.6) / (27.8 - 27.6) = 0.586
  longitude': (85.3240 - 85.2) / (85.4 - 85.2) = 0.620
  rent': (15000 - 1000) / (50000 - 1000) = 0.304

Normalized vectors: [0.586, 0.620, 0.304]
```

**Step 2: K-Means Training**
```
1. Initialize k centroids (K-Means++ initialization)
2. Assign each property to nearest centroid
3. Recalculate centroid positions (mean of cluster points)
4. Repeat until convergence (max 100 iterations)

Property assignments:
  Cluster 0: [prop_1, prop_3, prop_5, ...]
  Cluster 1: [prop_2, prop_4, prop_6, ...]
  ...
```

**Step 3: User Prediction**
```
New User Preference:
  city: "Kathmandu"
  min_rent: 10000, max_rent: 20000

User vector (normalized): [0.586, 0.623, 0.350]

Calculate distance to each centroid:
  Cluster 0: dist = 0.046
  Cluster 1: dist = 0.082
  ...

Nearest cluster: 0 (minimum distance)
Return properties from cluster 0
```

---

## 11. PERFORMANCE CHARACTERISTICS

### 11.1 Computation Complexity

| Operation | Complexity | Time (est.) |
|-----------|-----------|------------|
| TF-IDF Fit | O(n×m) | 500ms (100 properties) |
| TF-IDF Transform | O(m) per property | 5ms per property |
| Cosine Similarity | O(d) per pair | 0.1ms per comparison |
| Similar Search (top-20) | O(n×d) | 50ms for 100 properties |
| K-Means Fit | O(n×k×i) | 200ms (100 props, 10 clusters, 100 iters) |
| K-Means Predict | O(k×d) | 1ms (10 clusters, 3 features) |

### 11.2 Caching Strategy

- **Feature Vectors**: Pre-computed & cached in `property_feature_vectors` table
- **User Profiles**: Cached in `user_preference_profiles`, updated weekly
- **Cluster Data**: Cached in `geo_clusters`, updated every 6 hours
- **Trending Scores**: Cached in `trending_listings`, updated daily

### 11.3 Recommended Database Indexes

```sql
-- For fast recommendation queries
CREATE INDEX idx_ml_rec_user ON ml_recommendations(user_id, dismissed, expires_at);
CREATE INDEX idx_user_search_user_date ON user_search_interactions(user_id, created_at DESC);
CREATE INDEX idx_property_views_user_date ON property_views_ml(user_id, created_at DESC);
CREATE INDEX idx_geo_clusters_cluster ON geo_clusters(cluster_id);

-- For similarity calculations
CREATE INDEX idx_property_vectors_listing ON property_feature_vectors(listing_id);
CREATE INDEX idx_user_profiles_user ON user_preference_profiles(user_id);
```

---

## 12. KEY FUNCTIONS REFERENCE

### 12.1 MLRecommendationService

| Method | Purpose | Returns |
|--------|---------|---------|
| `trainModels()` | Train TF-IDF & K-Means | `{success, stats}` |
| `buildUserPreferenceProfile(userId)` | Create user ML profile | TF-IDF vector |
| `generateContentBasedRecommendations(userId, topN)` | Content filtering | Array of properties |
| `generateColdStartRecommendations(userId, prefs, topN)` | Cluster-based | Array of properties |
| `fallbackPreferenceBasedRecommendations(userId, prefs, topN)` | SQL filtering | Array of properties |
| `generateRecommendations(userId, userPrefs)` | Main entry point | Array of properties |
| `generateExplanation(property, score)` | Human-readable reason | String |

### 12.2 AIRecommendationService

| Method | Purpose |
|--------|---------|
| `generateSearchBasedRecommendations(userId, topN)` | Recent search analysis |
| `generatePreferenceBasedRecommendations(userId, topN)` | Aggregated preferences |
| `generateTrendingRecommendations(userId, topN)` | Popular properties |
| `generateCollaborativeRecommendations(userId, topN)` | Similar user patterns |
| `generateAllRecommendations(userId, location)` | Combined approach |
| `updateTrendingListings()` | Cache trending scores |

### 12.3 MLUserInteraction

| Method | Purpose |
|--------|---------|
| `trackSearch(userId, filters)` | Record search event |
| `trackPropertyView(userId, listingId, engagement)` | Record view event |
| `updateEngagement(userId, listingId, engagement)` | Update view metrics |
| `getUserSearchHistory(userId, limit)` | Get user's searches |
| `getUserPropertyViews(userId, limit)` | Get user's viewed properties |
| `getUserInteractionCount(userId)` | Count interactions by type |
| `hasSufficientHistory(userId, minInteractions)` | Check if enough data |

---

## 13. SYSTEM INTERACTION DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  [Search] [View Property] [Add to Favorites] [Contact Landlord]  │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ├─► POST /listings/search ────┐
                 │                              │
                 ├─► POST /recommendations/ml/track-search
                 ├─► POST /recommendations/ml/track-view
                 └─► GET /recommendations?algorithm=ml
                                              │
                 ┌────────────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │  CONTROLLER LAYER   │
        │ (Recommendation)    │
        └────────┬────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
        ▼                   ▼
    ┌─────────────┐   ┌──────────────┐
    │ ML Service  │   │ AI Service   │
    └─────┬───────┘   └──────┬───────┘
          │                  │
          ├─► TF-IDF         ├─► Search History
          ├─► K-Means        ├─► Trending
          ├─► Vectorizer     ├─► Collaborative
          └─► Clustering     └─► Aggregation
          │                  │
          ▼                  ▼
    ┌─────────────────────────────────┐
    │   Database Layer (PostgreSQL)   │
    ├─────────────────────────────────┤
    │ ml_recommendations              │
    │ user_preference_profiles        │
    │ property_feature_vectors        │
    │ user_search_interactions        │
    │ property_views_ml               │
    │ geo_clusters                    │
    │ user_search_preferences         │
    │ recommendations                 │
    │ trending_listings               │
    │ listings (core data)            │
    └─────────────────────────────────┘
          │
          ▼
    ┌─────────────────────┐
    │  ML SCHEDULER       │
    │ (Every 6h / 30min)  │
    │ - Train Models      │
    │ - Generate Recs     │
    │ - Update Trending   │
    └─────────────────────┘
```

---

## 14. EXAMPLE SCENARIOS

### Scenario 1: New User (Cold-Start)

```
User A registers, searches "2BR in Kathmandu, 15,000-18,000"
├─ Search recorded in user_search_interactions
├─ Check hasSufficientHistory() → NO (1 interaction < 3)
├─ Check hasPreferences() → Maybe (depends on if they set preferences)
├─ Falls back to generateColdStartRecommendations()
│  ├─ User vector: [latitude: 27.7, longitude: 85.3, rent: 16500]
│  ├─ Predict cluster via K-Means → Cluster 2
│  ├─ Get properties from Cluster 2
│  └─ Return top 20 with confidence scores (capped at 75%)
└─ ML Recommendation saved with explanation:
   "Property in Kathmandu matching your location and budget preferences
    (Avg rent: Rs. 16,200)"
```

### Scenario 2: Established User (Content-Based)

```
User B has searched 25 times, viewed 50 properties in last month
├─ Check hasSufficientHistory() → YES (75 interactions > 3)
├─ Call buildUserPreferenceProfile()
│  ├─ Aggregate searches: Preferred cities = [Kathmandu (30), Lalitpur (20)]
│  ├─ Aggregate views: Avg rent = 12,500, avg bedrooms = 2
│  ├─ Create "User B Preference Property" object
│  └─ Generate TF-IDF vector from profile
├─ Call generateContentBasedRecommendations()
│  ├─ Load user vector
│  ├─ Compute cosine similarity: [prop_1: 0.87, prop_5: 0.84, ...]
│  └─ Return top 20 where similarity > 0.3
└─ ML Recommendations saved with explanations:
   "87% match based on your search history. Located in Kathmandu,
    2 bedrooms, Rs. 13,500/month."
```

### Scenario 3: Trending Recommendations

```
In the last 7 days:
├─ prop_X: 150 views, 20 favorites, 5 inquiries
│  → trend_score = (150×0.5 + 20×1.5 + 5×2) / 10 = 11.5
├─ prop_Y: 200 views, 25 favorites, 8 inquiries
│  → trend_score = (200×0.5 + 25×1.5 + 8×2) / 10 = 14.35
└─ prop_Z: 80 views, 10 favorites, 2 inquiries
   → trend_score = (80×0.5 + 10×1.5 + 2×2) / 10 = 5.9

Top trending returned:
1. prop_Y (score: 0.95)
2. prop_X (score: 0.92)
3. prop_Z (score: 0.59)
```

---

## 15. CONFIGURATION & TUNING

### 15.1 Adjustable Parameters

**TF-IDF Vectorizer**:
```javascript
{
  maxFeatures: 500,           // Vocabulary size
  minDocFrequency: 2,         // Min documents term must appear in
}
```

**K-Means Clusterer**:
```javascript
{
  numClusters: auto,          // Adjusted by property count
  maxIterations: 100,         // Convergence threshold
}
```

**Similarity Thresholds**:
```javascript
Content-based: 0.3 (30%)          // Min cosine similarity
Cold-start: 0.75 (75% max)        // Cap confidence score
Fallback: 0.6 (60%)               // Min match percentage
```

**Scheduler Timing**:
```javascript
Training interval: 6 hours        // Retrain ML models
Generation interval: 30 minutes   // Generate recommendations
Cold-start check: >= 3 interactions
```

**Recommendation Limits**:
```javascript
Top N: 20 recommendations default
Search-based: 8 per algorithm
Trending: 5
Collaborative: 8
Total AI: ~29 unique
```

### 15.2 Tuning Recommendations

- **Increase maxFeatures** (500→1000) if recommendations become too generic
- **Lower minDocFrequency** (2→1) to include rarer terms
- **Increase similarity threshold** (0.3→0.5) for stricter matching
- **Adjust cluster count** based on property database size
- **Increase scheduler frequency** for faster user feedback loop

---

## 16. ERROR HANDLING & FALLBACKS

### 16.1 Graceful Degradation

```
generateRecommendations()
├─ Try content-based (requires history) 
├─ CATCH → Try preference-based (requires saved preferences)
├─ CATCH → Try cold-start clustering (requires 3+ properties)
├─ CATCH → Try fallback SQL filtering (always available)
└─ CATCH → Return empty array, log error
```

### 16.2 Specific Failure Modes

| Scenario | Handling |
|----------|----------|
| K-Means fails (< 3 properties) | Falls back to preference SQL |
| User has no interaction history | Uses cold-start K-Means |
| No saved preferences exist | Uses cold-start clustering |
| All algorithms return 0 results | Returns empty, prompts user to refine search |
| Database connection fails | Logs error, returns 500 response |
| Model training exceeds 6 hours | Skips run, tries again in 6 hours |

---

## 17. FILE STRUCTURE

```
backend/
├── services/
│   ├── ml-recommendation-service.js    # Primary ML engine
│   └── ai-recommendation-service.js    # Complementary AI engine
├── ml-recommendation/
│   ├── tfidf-vectorizer.js             # TF-IDF implementation
│   └── kmeans-clusterer.js             # K-Means implementation
├── models/
│   ├── MLRecommendation.js             # ML recommendation storage
│   ├── MLUserPreference.js             # ML user profiles
│   └── UserPreferences.js              # Saved user preferences
├── controllers/
│   └── recommendation-controller.js    # API handlers
├── routes/
│   └── recommendations.js              # Route definitions
└── schedulers/
    └── ml-scheduler.js                 # Periodic training/generation
```

---

## 18. SUMMARY

**KHOJGHAR's recommendation system is a sophisticated hybrid architecture** combining:

1. **ML-Based** (Primary): TF-IDF content filtering + K-Means clustering
2. **AI-Based** (Complementary): Search history, trending, collaborative filtering
3. **Intelligent Fallbacks**: Multi-level degradation from content-based → cold-start → preference-based → SQL
4. **Real-time Tracking**: User interactions feed into model training
5. **Periodic Retraining**: Every 6 hours for fresh insights
6. **Explainability**: Every recommendation includes matching features and human-readable explanation
7. **Location-Aware**: Geographic clustering and distance-based filtering
8. **Scalable**: Supports 100s of users per recommendation cycle

This architecture provides **academic-quality ML implementation** while maintaining **production reliability and user experience**.

---

*Last Updated: April 2026*
*Version: 1.0*
