/**
 * Recommendation system utility functions
 */

/**
 * Calculate similarity between two users based on their preferences
 * Uses cosine similarity between user vectors
 * 
 * @param {Array} userAPreferences - Array of items user A has interacted with
 * @param {Array} userBPreferences - Array of items user B has interacted with
 * @returns {number} - Similarity score between 0 and 1
 */
export const calculateSimilarity = (userAPreferences, userBPreferences) => {
  // Convert preferences arrays to sets for faster lookup
  const setA = new Set(userAPreferences);
  const setB = new Set(userBPreferences);
  
  // Find common items
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersection++;
    }
  }
  
  // If no common items, similarity is 0
  if (intersection === 0) return 0;
  
  // Calculate cosine similarity: intersection / sqrt(|A| * |B|)
  return intersection / Math.sqrt(setA.size * setB.size);
};

/**
 * Calculate content-based similarity between items
 * 
 * @param {Object} itemA - First item with attributes
 * @param {Object} itemB - Second item with attributes
 * @param {Array} attributes - Attributes to compare (e.g., ['genre', 'mood', 'tempo'])
 * @returns {number} - Similarity score between 0 and 1
 */
export const calculateContentSimilarity = (itemA, itemB, attributes) => {
  let matchingAttributes = 0;
  
  for (const attr of attributes) {
    if (itemA[attr] && itemB[attr] && itemA[attr] === itemB[attr]) {
      matchingAttributes++;
    }
  }
  
  return matchingAttributes / attributes.length;
};

/**
 * Get recommended items for a user using collaborative filtering
 * 
 * @param {number} userId - ID of the user to get recommendations for
 * @param {Array} userPreferences - Items the user has interacted with
 * @param {Array} similarUsers - Array of users similar to the target user
 * @param {Array} allItems - All available items
 * @returns {Array} - Recommended items sorted by relevance
 */
export const getCollaborativeFilteringRecommendations = (userId, userPreferences, similarUsers, allItems) => {
  // Create a set of items the user has already interacted with
  const userItems = new Set(userPreferences.map(pref => pref.itemId));
  
  // Calculate scores for all items the user hasn't interacted with yet
  const itemScores = new Map();
  
  for (const similarUser of similarUsers) {
    // Get similarity score between target user and this similar user
    const similarity = similarUser.similarityScore;
    
    // Get preferences of the similar user
    const similarUserPrefs = similarUser.preferences;
    
    for (const pref of similarUserPrefs) {
      // Skip items the target user has already interacted with
      if (userItems.has(pref.itemId)) continue;
      
      // Calculate score contribution for this item
      const currentScore = itemScores.get(pref.itemId) || 0;
      itemScores.set(pref.itemId, currentScore + (similarity * pref.rating));
    }
  }
  
  // Convert scores map to an array of [itemId, score]
  const scoreArray = Array.from(itemScores.entries());
  
  // Sort by score in descending order
  scoreArray.sort((a, b) => b[1] - a[1]);
  
  // Map item IDs to full item objects and return
  return scoreArray.map(([itemId, score]) => {
    const item = allItems.find(i => i.id === itemId);
    return {
      ...item,
      recommendationScore: score
    };
  });
};

/**
 * Generate diverse recommendations by ensuring variety in results
 * 
 * @param {Array} recommendations - Raw recommendations
 * @param {string} diversityAttribute - Attribute to diversify by (e.g., 'genre')
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} - Diverse recommendations
 */
export const generateDiverseRecommendations = (recommendations, diversityAttribute, limit) => {
  if (!recommendations.length) return [];
  
  const diverseRecommendations = [];
  const seenAttributes = new Set();
  
  // First pass: Include highest-scored item from each attribute
  for (const item of recommendations) {
    const attrValue = item[diversityAttribute];
    
    if (attrValue && !seenAttributes.has(attrValue)) {
      diverseRecommendations.push(item);
      seenAttributes.add(attrValue);
      
      if (diverseRecommendations.length >= limit) {
        return diverseRecommendations;
      }
    }
  }
  
  // Second pass: Fill remaining slots with top-scored items not yet included
  for (const item of recommendations) {
    if (!diverseRecommendations.includes(item)) {
      diverseRecommendations.push(item);
      
      if (diverseRecommendations.length >= limit) {
        return diverseRecommendations;
      }
    }
  }
  
  return diverseRecommendations;
}; 