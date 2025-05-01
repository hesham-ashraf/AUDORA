// Constants for IndexedDB
const DB_NAME = 'audora_offline_db';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const ALBUMS_STORE = 'albums';
const PODCASTS_STORE = 'podcasts';

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('Error opening offline database');
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
        db.createObjectStore(ALBUMS_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(PODCASTS_STORE)) {
        db.createObjectStore(PODCASTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Save track for offline use
const saveTrackOffline = async (track) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(TRACKS_STORE, 'readwrite');
    const store = transaction.objectStore(TRACKS_STORE);
    
    // Fetch the audio file and store as ArrayBuffer
    const response = await fetch(track.audioUrl);
    const audioData = await response.arrayBuffer();
    
    // Store track with audio data
    const trackWithData = {
      ...track,
      audioData,
      savedAt: new Date().toISOString()
    };
    
    store.put(trackWithData);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject('Error saving track offline');
    });
  } catch (error) {
    console.error('Failed to save track offline:', error);
    throw error;
  }
};

// Get offline track
const getOfflineTrack = async (trackId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(TRACKS_STORE, 'readonly');
    const store = transaction.objectStore(TRACKS_STORE);
    const request = store.get(trackId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error retrieving offline track');
    });
  } catch (error) {
    console.error('Failed to get offline track:', error);
    throw error;
  }
};

// Get all offline tracks
const getAllOfflineTracks = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction(TRACKS_STORE, 'readonly');
    const store = transaction.objectStore(TRACKS_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error retrieving offline tracks');
    });
  } catch (error) {
    console.error('Failed to get offline tracks:', error);
    throw error;
  }
};

// Save album for offline use
const saveAlbumOffline = async (album) => {
  try {
    const db = await initDB();
    const albumTransaction = db.transaction(ALBUMS_STORE, 'readwrite');
    const albumStore = albumTransaction.objectStore(ALBUMS_STORE);
    
    // Store album metadata
    const albumData = {
      ...album,
      isOffline: true,
      savedAt: new Date().toISOString()
    };
    
    albumStore.put(albumData);
    
    // Wait for album transaction to complete
    await new Promise((resolve, reject) => {
      albumTransaction.oncomplete = () => resolve(true);
      albumTransaction.onerror = () => reject('Error saving album offline');
    });
    
    // Save each track
    for (const track of album.tracks) {
      await saveTrackOffline(track);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save album offline:', error);
    throw error;
  }
};

// Check if online
const isOnline = () => navigator.onLine;

// Add event listeners for online/offline status
const setupOfflineListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

const offline = {
  initDB,
  saveTrackOffline,
  getOfflineTrack,
  getAllOfflineTracks,
  saveAlbumOffline,
  isOnline,
  setupOfflineListeners
};

export default offline; 