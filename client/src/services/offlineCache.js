/**
 * offlineCache.js
 * Service de cache IndexedDB pour le stockage hors-ligne des prpas
 * 
 * Structure IndexedDB :
 * - Store "prepas" : { prepaId, data, expirationDate, savedAt }
 *   data = { prepa, disciplines, lecons, exercices, anciensSujets }
 */

const DB_NAME = 'PrepaCamerounOffline';
const DB_VERSION = 1;
const STORE_NAME = 'prepas';

/**
 * Ouvre la base de donnes IndexedDB
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'prepaId' });
        store.createIndex('expirationDate', 'expirationDate', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Erreur IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Sauvegarde une prpa complte dans le cache hors-ligne
 * Vrifie que la date d'expiration est valide avant de sauvegarder
 */
export const savePrepaForOffline = async (prepaId, data, expirationDate) => {
  try {
    // Vrifier que la date d'expiration est valide et non dj expire
    if (!expirationDate) {
      return { success: false, error: "Date d'expiration manquante" };
    }

    const expDate = expirationDate instanceof Date ? expirationDate : new Date(expirationDate);
    if (isNaN(expDate.getTime())) {
      return { success: false, error: "Date d'expiration invalide" };
    }

    const now = new Date();
    if (expDate <= now) {
      return { success: false, error: "Cette inscription a expir. Sauvegarde hors-ligne impossible." };
    }

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      prepaId,
      data,
      expirationDate: expDate.toISOString(),
      savedAt: new Date().toISOString()
    };

    await new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    return { success: true };
  } catch (error) {
    console.error('Erreur sauvegarde offline:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Rcupre une prpa depuis le cache hors-ligne
 */
export const getOfflinePrepa = async (prepaId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const record = await new Promise((resolve, reject) => {
      const request = store.get(prepaId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!record) return null;

    // Vrifier l'expiration
    const expDate = new Date(record.expirationDate);
    if (isNaN(expDate.getTime()) || expDate <= new Date()) {
      await removeOfflinePrepa(prepaId);
      return null;
    }

    return record.data;
  } catch (error) {
    console.error('Erreur lecture cache offline:', error);
    return null;
  }
};

/**
 * Rcupre la liste de toutes les prpas sauvegardes
 */
export const getOfflinePrepasList = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const allRecords = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    const now = new Date();
    const valid = [];
    const expired = [];

    for (const record of allRecords) {
      const expDate = new Date(record.expirationDate);
      if (expDate <= now) {
        expired.push(record.prepaId);
      } else {
        valid.push({
          prepaId: record.prepaId,
          expirationDate: record.expirationDate,
          savedAt: record.savedAt,
          nom: record.data?.prepa?.nom || 'Prpa'
        });
      }
    }

    for (const id of expired) {
      await removeOfflinePrepa(id);
    }

    return valid;
  } catch (error) {
    console.error('Erreur liste cache offline:', error);
    return [];
  }
};

/**
 * Supprime une prpa du cache hors-ligne
 */
export const removeOfflinePrepa = async (prepaId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.delete(prepaId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression cache offline:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Nettoie toutes les prpas expires du cache
 * Vrifie aussi les dates invalides (NaN)
 */
export const cleanExpiredPrepas = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('expirationDate');

    const now = new Date().toISOString();
    const range = IDBKeyRange.upperBound(now);

    const expiredRecords = await new Promise((resolve, reject) => {
      const request = index.getAllKeys(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    let deletedCount = 0;
    for (const key of expiredRecords) {
      await new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => { deletedCount++; resolve(); };
        request.onerror = () => reject(request.error);
      });
    }

    // Supprimer aussi les enregistrements avec date invalide (NaN)
    const allRecords = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const record of allRecords) {
      const expDate = new Date(record.expirationDate);
      if (isNaN(expDate.getTime())) {
        await new Promise((resolve, reject) => {
          const request = store.delete(record.prepaId);
          request.onsuccess = () => { deletedCount++; resolve(); };
          request.onerror = () => reject(request.error);
        });
      }
    }

    db.close();
    return deletedCount;
  } catch (error) {
    console.error('Erreur nettoyage cache offline:', error);
    return 0;
  }
};

/**
 * Vrifie si une prpa est disponible hors-ligne
 */
export const isPrepaAvailableOffline = async (prepaId) => {
  const data = await getOfflinePrepa(prepaId);
  return data !== null;
};

/**
 * Rcupre la taille approximative du cache (en octets)
 */
export const getCacheSize = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const allRecords = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    let totalSize = 0;
    for (const record of allRecords) {
      totalSize += new Blob([JSON.stringify(record)]).size;
    }
    return totalSize;
  } catch (error) {
    console.error('Erreur calcul taille cache:', error);
    return 0;
  }
};