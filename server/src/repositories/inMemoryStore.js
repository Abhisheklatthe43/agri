/**
 * In-memory fallback repository when Supabase PostgreSQL is not yet connected
 * Ensures seamless local development, testing, and continuous operation
 */
class InMemoryStore {
  constructor() {
    this.profiles = new Map();
    this.cropRecommendations = new Map();
    this.diseaseAnalyses = new Map();
    this.fertilizerAdvisories = new Map();
    this.irrigationAdvisories = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    this.notifications = new Map();
  }

  // Profile
  getProfile(userId) {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, {
        id: userId,
        full_name: 'Farmer User',
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Khed',
        farm_area: 5,
        farm_area_unit: 'acre',
        soil_type: 'Black soil',
        irrigation_availability: 'Drip irrigation',
        farming_experience: '10 years',
        preferred_language: 'en',
        primary_crops: ['Soybean', 'Wheat', 'Tomato'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    return this.profiles.get(userId);
  }

  updateProfile(userId, data) {
    const existing = this.getProfile(userId);
    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  // Generic items by user
  addItem(mapName, item) {
    const id = item.id || crypto.randomUUID();
    const fullItem = { ...item, id, created_at: item.created_at || new Date().toISOString() };
    this[mapName].set(id, fullItem);
    return fullItem;
  }

  getItemsByUser(mapName, userId) {
    const items = [];
    for (const val of this[mapName].values()) {
      if (val.user_id === userId) {
        items.push(val);
      }
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getItemById(mapName, id, userId) {
    const item = this[mapName].get(id);
    if (!item || item.user_id !== userId) return null;
    return item;
  }

  deleteItem(mapName, id, userId) {
    const item = this[mapName].get(id);
    if (!item || item.user_id !== userId) return false;
    this[mapName].delete(id);
    return true;
  }

  // Chat
  getMessagesByConversation(conversationId, userId) {
    const msgs = [];
    for (const val of this.chatMessages.values()) {
      if (val.conversation_id === conversationId && val.user_id === userId) {
        msgs.push(val);
      }
    }
    return msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
}

export const inMemoryStore = new InMemoryStore();
