// import fs from 'fs';
// import path, { dirname } from 'path';
// import { fileURLToPath } from 'url';
// const fsPromises = fs.promises;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import commonPath from '../../middleware/comman_path/comman.path.js';

// const { basePathRoute } = commonPath;

// const BASE_DIR = path.join(__dirname, '../../resources/json');

// // List of peer backend instances (adjust ports/hosts as needed)
// const PEERS = [
   
// ];
 
// function ensureDir(filePath) {
//   const dir = path.dirname(filePath);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//   if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
// }

// function getFilePath(relativePath) {
//   const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
//   return path.join(BASE_DIR, safePath);
// }

// async function load(filePath) {
//   await ensureDir(filePath);
//   const data = await fsPromises.readFile(filePath, 'utf-8');
//   return JSON.parse(data || '{}');
// }

// async function save(filePath, data) {
//   await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
// }

// function isExpired(entry) {
//   return entry.expiresAt && Date.now() > entry.expiresAt;
// }

// function getRemainingMs(entry) {
//   return entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now()) : null;
// }
// function formatDate(timestamp) {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'
//   }
//   function formatTimeRemaining(ms) {
//     if (ms <= 0) return '00:00:00';
  
//     const totalSeconds = Math.floor(ms / 1000);
//     const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
//     const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
//     const seconds = String(totalSeconds % 60).padStart(2, '0');
  
//     return `${hours}:${minutes}:${seconds}`;
//   }
    
// function deleteFile(filePath) {
//     try {
//       fs.unlinkSync(filePath);  // Delete the expired file
//       console.log(`File ${filePath} deleted due to expiration.`);
//     } catch (err) {
//       console.error(`Error deleting file ${filePath}:`, err);
//     }
//   }
  
//   export async function broadcastToPeers(relativePath, operation, data = null, field = null) {
//   for (const peer of PEERS) {
//     const fullUrl = `${peer}${basePathRoute}/json_auto_update_common/sync/push`;
//     try {
//       await axios.post(fullUrl, {
//         path: relativePath,
//         operation,
//         data,
//         field
//       });
//     } catch (err) {
//       console.warn(`⚠️ Push to peer ${peer} failed:`, err.message);
//     }
//   }
// }



// async function set(relativePath, key, newValue, ttlMs = null) {
//   try{
//   const filePath = path.join(BASE_DIR, relativePath);
//   const now = Date.now();
//   const expiresAt = ttlMs ? now + ttlMs : null;
//   // Initialize default file structure
//   let fileData = {
//     value: [],
//     createdAt: now,
//     updatedAt: now,
//     expiresAt,
//     ttlMs
//   };
//   let operationType = ""
//   // If file exists, read it
//   if (fs.existsSync(filePath)) {
//     try {
//       const raw = fs.readFileSync(filePath, 'utf8');
//     //   console.log("🔍 Raw file content:", raw);
//       const parsed = JSON.parse(raw);
//       fileData = {
//         value:Array.isArray(parsed.value) ? parsed.value : [],
//         updatedAt: now,
//         expiresAt,
//         ttlMs
//       };
//     } catch (err) {
//         console.warn('⚠️ Error parsing JSON, resetting file:', err);
//     }
//   }
//   if (!Array.isArray(fileData.value)) {
//     fileData.value = [];
//   }
//   // Work with the array inside `value`
//   let updated = false;
//   if (key) {
//     // Try to find and update entry by key (e.g., user_id or id)
//     fileData.value = fileData.value.map(item => {
//       if (item[key] !== undefined && item[key] == newValue[key]) {
//         updated = true;
//         return newValue;  // Replace instead of merging
//       }
//       return item;
//     });
//     if (!updated) {
//       fileData.value.push(newValue); 
//     }
//     operationType = 'ADD_OR_UPDATE';
//   }else{
//     operationType = 'FULL_REPLACE';
//     fileData.value = newValue
//   }

//   // If not updated (no key match), push as new
  
// // // Split the relative path to get the directory
// // const dir = path.join(BASE_DIR, relativePath.substring(0, relativePath.lastIndexOf('/')));
// // await fs.promises.mkdir(dir, { recursive: true });

//  // Ensure directory exists
//     const dir = path.dirname(filePath);
//     await fs.promises.mkdir(dir, { recursive: true });
    
//   // Save file
//    // Use async write
//    await fs.promises.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
//    if(operationType!==""){
//    await broadcastToPeers(relativePath, operationType, newValue, key);
//    }

//   return true;
// }catch(error){
//   console.log(" inside json set error -->",error)
// }
// }




// async function getById(relativePath, field, value) {
//     const filePath = getFilePath(relativePath);
//     const db = await load(filePath);
//     // Check for file expiration
//     if (isExpired(db)) {
//         deleteFile(filePath);  // Delete expired file
//         return [];
//       }
//     // Ensure the value is an array and search for the entry by the given field and value
//     const entry = db.value && Array.isArray(db.value)
//       ? db.value.find(item => item[field] == value)
//       : [];
  
//     if (!entry || isExpired(entry)) {
//       return [];
//     }
    
//     return {
//       value: entry,
//       createdAt: formatDate(db.createdAt),
//       updatedAt: formatDate(db.updatedAt),
//       expiresAt: formatDate(db.expiresAt),
//       ttlMs: formatTimeRemaining(db.ttlMs),
//       remainingMs: formatTimeRemaining(getRemainingMs(entry))
//     };
//   }

// async function getAllByField(relativePath, field, value) {
//   const filePath = getFilePath(relativePath);
//   const db = await load(filePath);

//   // Check for file expiration
//   if (isExpired(db)) {
//     deleteFile(filePath);  // Delete expired file
//     return [];
//   }

//   // Filter all matching entries
//   // Filter all matching entries
//   const entries = db.value && Array.isArray(db.value)
//     ? db.value.filter(item => item[field] == value)
//     : [];

//   if (!entries.length) {
//     return [];
//   }

//   return {
//     values: entries,
//     createdAt: formatDate(db.createdAt),
//     updatedAt: formatDate(db.updatedAt),
//     expiresAt: formatDate(db.expiresAt),
//     ttlMs: formatTimeRemaining(db.ttlMs),
//     remainingMs: formatTimeRemaining(getRemainingMs(db))
//   };

// }

  

//   async function getAll(relativePath) {
//     const filePath = path.join(BASE_DIR, relativePath);
    
//     if (!fs.existsSync(filePath)) {
//       return [];  // Return an empty array if the file doesn't exist
//     }
   
//     try {
//       const raw = await fs.promises.readFile(filePath, 'utf8');
//       const parsed = JSON.parse(raw);
//       // Check for file expiration
//       if (isExpired(parsed)) {
//         deleteFile(filePath);  // Delete expired file
//         return [];  // Return empty array if expired
//       }
//       // Ensure `value` is an array and return it
//         // Check if `parsed.value` is an object and return its properties
//     const remainingMs = parsed.expiresAt ? parsed.expiresAt - Date.now() : null;
//     if (parsed.value && typeof parsed.value === 'object') {
//         return {
//             data:parsed.value,
//             createdAt: formatDate(parsed.createdAt),
//             updatedAt: formatDate(parsed.updatedAt),
//             expiresAt: formatDate(parsed.expiresAt),
//             ttlMs: formatTimeRemaining(parsed.ttlMs),
//             remainingMs:formatTimeRemaining(remainingMs)
//         };  // Return the object if it's structured as expected
//       }
//       return []
//     } catch (err) {
//       console.warn('⚠️ Error reading or parsing file:', err);
//       return [];  // Return an empty array if error occurs
//     }
//   }

// async function remove(relativePath, key, value) {
//   const filePath = getFilePath(relativePath);
//   const db = await load(filePath);

//   if (Array.isArray(db.value)) {
//     const originalLength = db.value.length;

//     // Filter out the object with the matching key-value pair
//     db.value = db.value.filter(item => item[key] !== value);

//     // If at least one object was removed, update updatedAt and save
//     if (db.value.length < originalLength) {
//       db.updatedAt = Date.now();
//       await save(filePath, db);
//       return true;
//     }
//   }
//   await broadcastToPeers(relativePath, 'DELETE', { [key]: value }, key);


//   // Nothing was removed
//   return false;
// }

// async function checkDataStatus(relativePath) {
//   const filePath = getFilePath(relativePath);
//   try {
//     await fsPromises.access(filePath);
//     const raw = await fsPromises.readFile(filePath, 'utf8');
//     const parsed = JSON.parse(raw);

//     if (isExpired(parsed)) {
//       deleteFile(filePath);
//       return { exists: false, expired: true, totalCount: 0 };
//     }

//     const totalCount = Array.isArray(parsed.value) ? parsed.value.length : 0;
//     return { exists: true, expired: false, totalCount };

//   } catch (err) {
//     console.log("json err-->",err)
//     if (err.code === 'ENOENT') {
//       console.log("inside if")
//       return { exists: false, expired: false, totalCount: 0 };
//     } else {
//       console.log("inside else")
//       console.error('Error reading file:', filePath, err);
//       throw err;
//     }
//   }
// }
// async function deleteFullFile(relativePath) {
//   const filePath = getFilePath(relativePath);

//   try {
//     await fsPromises.unlink(filePath);  // deletes the file
//     console.log(`File ${filePath} deleted.`);
//     await broadcastToPeers(relativePath, 'DELETE_FILE');
//     return true;
//   } catch (err) {
//     console.error(`Error deleting file ${filePath}:`, err);
//     return false;
//   }
// }

// const LocalJsonHelper = {
//   set,
//   getById,
//   getAll,
//   getAllByField,
//   remove,
//   checkDataStatus,
//   deleteFullFile
// };

// export default LocalJsonHelper;


import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const fsPromises = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import commonPath from '../../middleware/comman_path/comman.path.js';

const { basePathRoute } = commonPath;

const BASE_DIR = path.join(__dirname, '../../resources/json');

// Cache Configuration
const CacheConfig = {
  MAX_ENTRIES_FOR_MEMORY: 1000,
  MAX_FILE_SIZE_MB: 1,
  ENABLE_MEMORY_CACHE: true,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes default
  STATS_UPDATE_INTERVAL: 60000 // Update stats every minute
};

// In-memory cache
class MemoryCache {
  constructor() {
    this._cache = new Map();
    this._cacheSizes = new Map();
    this._cacheTimestamps = new Map();
    this._stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
    
    // Periodic cleanup of expired entries
    setInterval(() => this._cleanupExpired(), 60000);
  }

  _calculateSize(data) {
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this._cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this._cache.delete(key);
        this._cacheSizes.delete(key);
        this._cacheTimestamps.delete(key);
      }
    }
  }

  shouldCache(data) {
    const dataArray = Array.isArray(data) ? data : (data.value || []);
    const size = this._calculateSize(data);
    const sizeMB = size / (1024 * 1024);
    const entryCount = dataArray.length;

    return (
      CacheConfig.ENABLE_MEMORY_CACHE &&
      entryCount <= CacheConfig.MAX_ENTRIES_FOR_MEMORY &&
      sizeMB <= CacheConfig.MAX_FILE_SIZE_MB
    );
  }

  set(key, value, ttlMs = CacheConfig.CACHE_TTL_MS) {
    if (!this.shouldCache(value)) {
      return false;
    }

    const now = Date.now();
    const expiresAt = ttlMs ? now + ttlMs : null;
    
    this._cache.set(key, {
      data: value,
      expiresAt,
      cachedAt: now
    });
    
    this._cacheSizes.set(key, this._calculateSize(value));
    this._cacheTimestamps.set(key, now);
    
    return true;
  }

  get(key) {
    this._stats.totalRequests++;
    
    const entry = this._cache.get(key);
    if (!entry) {
      this._stats.misses++;
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this._stats.misses++;
      return null;
    }

    this._stats.hits++;
    return entry.data;
  }

  delete(key) {
    this._cache.delete(key);
    this._cacheSizes.delete(key);
    this._cacheTimestamps.delete(key);
  }

  clear() {
    this._cache.clear();
    this._cacheSizes.clear();
    this._cacheTimestamps.clear();
  }

  getStats() {
    const totalSize = Array.from(this._cacheSizes.values()).reduce((a, b) => a + b, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    return {
      size: this._cache.size,
      max_entries_threshold: CacheConfig.MAX_ENTRIES_FOR_MEMORY,
      max_file_size_mb: CacheConfig.MAX_FILE_SIZE_MB,
      total_size_mb: Math.round(totalSizeMB * 100) / 100,
      cache_enabled: CacheConfig.ENABLE_MEMORY_CACHE,
      hits: this._stats.hits,
      misses: this._stats.misses,
      hit_rate: this._stats.totalRequests > 0 
        ? Math.round((this._stats.hits / this._stats.totalRequests) * 100) / 100 
        : 0,
      keys: Array.from(this._cache.keys()),
      cached_tables: Object.fromEntries(
        Array.from(this._cache.entries()).map(([key, entry]) => [
          key,
          {
            size_mb: Math.round((this._cacheSizes.get(key) / (1024 * 1024)) * 100) / 100,
            entries: Array.isArray(entry.data?.value) 
              ? entry.data.value.length 
              : (Array.isArray(entry.data) ? entry.data.length : 0),
            cached_at: new Date(this._cacheTimestamps.get(key)).toISOString(),
            expires_at: entry.expiresAt ? new Date(entry.expiresAt).toISOString() : null
          }
        ])
      )
    };
  }
}

const memoryCache = new MemoryCache();

// List of peer backend instances
const PEERS = [];

// Utility functions
function ensureDirSync(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFilePath(relativePath) {
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(BASE_DIR, safePath);
}

async function load(filePath) {
  // Try memory cache first
  const cached = memoryCache.get(filePath);
  if (cached) {
    return cached;
  }

  // Load from file
  ensureDirSync(filePath);
  
  if (!fs.existsSync(filePath)) {
    return { value: [], createdAt: Date.now(), updatedAt: Date.now() };
  }

  const data = await fsPromises.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(data || '{}');
  
  // Cache if eligible
  memoryCache.set(filePath, parsed);
  
  return parsed;
}

async function save(filePath, data) {
  // Save to file
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  
  // Update cache
  memoryCache.set(filePath, data);
}

function isExpired(entry) {
  return entry.expiresAt && Date.now() > entry.expiresAt;
}

function getRemainingMs(entry) {
  return entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now()) : null;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
}

function formatTimeRemaining(ms) {
  if (ms <= 0) return '00:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

async function deleteFile(filePath) {
  try {
    await fsPromises.unlink(filePath);
    memoryCache.delete(filePath);
    console.log(`File ${filePath} deleted due to expiration.`);
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
}

export async function broadcastToPeers(relativePath, operation, data = null, field = null) {
  // Use Promise.allSettled for parallel execution without blocking
  const promises = PEERS.map(peer => {
    const fullUrl = `${peer}${basePathRoute}/json_auto_update_common/sync/push`;
    return axios.post(fullUrl, {
      path: relativePath,
      operation,
      data,
      field
    }, { timeout: 5000 }).catch(err => {
      console.warn(`⚠️ Push to peer ${peer} failed:`, err.message);
      return null;
    });
  });

  await Promise.allSettled(promises);
}

async function set(relativePath, key, newValue, ttlMs = null) {
  try {
    const filePath = path.join(BASE_DIR, relativePath);
    const now = Date.now();
    const expiresAt = ttlMs ? now + ttlMs : null;

    let fileData = {
      value: [],
      createdAt: now,
      updatedAt: now,
      expiresAt,
      ttlMs
    };

    let operationType = "";

    // Load existing data (will use cache if available)
    if (fs.existsSync(filePath)) {
      try {
        const parsed = await load(filePath);
        fileData = {
          value: Array.isArray(parsed.value) ? parsed.value : [],
          createdAt: parsed.createdAt || now,
          updatedAt: now,
          expiresAt,
          ttlMs
        };
      } catch (err) {
        console.warn('⚠️ Error parsing JSON, resetting file:', err);
      }
    }

    if (!Array.isArray(fileData.value)) {
      fileData.value = [];
    }

    let updated = false;
    
    if (key) {
      // Find index for faster update
      const index = fileData.value.findIndex(item => 
        item[key] !== undefined && item[key] == newValue[key]
      );

      if (index !== -1) {
        fileData.value[index] = newValue;
        updated = true;
      } else {
        fileData.value.push(newValue);
      }
      operationType = 'ADD_OR_UPDATE';
    } else {
      operationType = 'FULL_REPLACE';
      fileData.value = newValue;
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fsPromises.mkdir(dir, { recursive: true });

    // Save file and update cache
    await save(filePath, fileData);

    // Broadcast to peers (non-blocking)
    if (operationType !== "" && PEERS.length > 0) {
      broadcastToPeers(relativePath, operationType, newValue, key).catch(err => 
        console.warn('Broadcast failed:', err)
      );
    }

    return true;
  } catch (error) {
    console.log("inside json set error -->", error);
    throw error;
  }
}

async function getById(relativePath, field, value) {
  const filePath = getFilePath(relativePath);
  const db = await load(filePath);

  if (isExpired(db)) {
    await deleteFile(filePath);
    return [];
  }

  const entry = db.value && Array.isArray(db.value)
    ? db.value.find(item => item[field] == value)
    : null;

  if (!entry || isExpired(entry)) {
    return [];
  }

  return {
    value: entry,
    createdAt: formatDate(db.createdAt),
    updatedAt: formatDate(db.updatedAt),
    expiresAt: db.expiresAt ? formatDate(db.expiresAt) : null,
    ttlMs: db.ttlMs ? formatTimeRemaining(db.ttlMs) : null,
    remainingMs: formatTimeRemaining(getRemainingMs(db))
  };
}

async function getAllByField(relativePath, field, value) {
  const filePath = getFilePath(relativePath);
  const db = await load(filePath);

  if (isExpired(db)) {
    await deleteFile(filePath);
    return [];
  }

  const entries = db.value && Array.isArray(db.value)
    ? db.value.filter(item => item[field] == value)
    : [];

  if (!entries.length) {
    return [];
  }

  return {
    values: entries,
    createdAt: formatDate(db.createdAt),
    updatedAt: formatDate(db.updatedAt),
    expiresAt: db.expiresAt ? formatDate(db.expiresAt) : null,
    ttlMs: db.ttlMs ? formatTimeRemaining(db.ttlMs) : null,
    remainingMs: formatTimeRemaining(getRemainingMs(db))
  };
}

async function getAll(relativePath) {
  const filePath = path.join(BASE_DIR, relativePath);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const parsed = await load(filePath);

    if (isExpired(parsed)) {
      await deleteFile(filePath);
      return [];
    }

    const remainingMs = parsed.expiresAt ? parsed.expiresAt - Date.now() : null;

    if (parsed.value && typeof parsed.value === 'object') {
      return {
        data: parsed.value,
        createdAt: formatDate(parsed.createdAt),
        updatedAt: formatDate(parsed.updatedAt),
        expiresAt: parsed.expiresAt ? formatDate(parsed.expiresAt) : null,
        ttlMs: parsed.ttlMs ? formatTimeRemaining(parsed.ttlMs) : null,
        remainingMs: formatTimeRemaining(remainingMs)
      };
    }

    return [];
  } catch (err) {
    console.warn('⚠️ Error reading or parsing file:', err);
    return [];
  }
}

async function remove(relativePath, key, value) {
  const filePath = getFilePath(relativePath);
  const db = await load(filePath);

  if (Array.isArray(db.value)) {
    const originalLength = db.value.length;
    db.value = db.value.filter(item => item[key] !== value);

    if (db.value.length < originalLength) {
      db.updatedAt = Date.now();
      await save(filePath, db);
      
      // Broadcast to peers (non-blocking)
      if (PEERS.length > 0) {
        broadcastToPeers(relativePath, 'DELETE', { [key]: value }, key).catch(err =>
          console.warn('Broadcast failed:', err)
        );
      }
      
      return true;
    }
  }

  return false;
}

async function checkDataStatus(relativePath) {
  const filePath = getFilePath(relativePath);
  
  try {
    await fsPromises.access(filePath);
    const parsed = await load(filePath);

    if (isExpired(parsed)) {
      await deleteFile(filePath);
      return { exists: false, expired: true, totalCount: 0 };
    }

    const totalCount = Array.isArray(parsed.value) ? parsed.value.length : 0;
    
    // Get file stats
    const stats = await fsPromises.stat(filePath);
    const sizeMB = stats.size / (1024 * 1024);
    
    return {
      exists: true,
      expired: false,
      totalCount,
      size_mb: Math.round(sizeMB * 100) / 100,
      is_cached: memoryCache.get(filePath) !== null,
      should_cache: memoryCache.shouldCache(parsed)
    };

  } catch (err) {
    if (err.code === 'ENOENT') {
      return { exists: false, expired: false, totalCount: 0 };
    }
    console.error('Error reading file:', filePath, err);
    throw err;
  }
}

async function deleteFullFile(relativePath) {
  const filePath = getFilePath(relativePath);

  try {
    await fsPromises.unlink(filePath);
    memoryCache.delete(filePath);
    console.log(`File ${filePath} deleted.`);
    
    // Broadcast to peers (non-blocking)
    if (PEERS.length > 0) {
      broadcastToPeers(relativePath, 'DELETE_FILE').catch(err =>
        console.warn('Broadcast failed:', err)
      );
    }
    
    return true;
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

// Cache management functions
function getCacheStats() {
  return memoryCache.getStats();
}

function clearCache() {
  memoryCache.clear();
  return { success: true, message: 'Cache cleared' };
}

function updateCacheConfig(config) {
  Object.assign(CacheConfig, config);
  return { success: true, config: CacheConfig };
}

const LocalJsonHelper = {
  set,
  getById,
  getAll,
  getAllByField,
  remove,
  checkDataStatus,
  deleteFullFile,
  getCacheStats,
  clearCache,
  updateCacheConfig
};

export default LocalJsonHelper;




/* ============================================
   USAGE EXAMPLES
   ============================================ */

// Example 1: Basic Set/Get Operations
async function example1_BasicOperations() {
  // Set a single user (will be cached if < 1MB and < 1000 entries)
  await LocalJsonHelper.set(
    'users/active_users.json',
    'user_id',
    { user_id: 123, name: 'John Doe', email: 'john@example.com' },
    300000 // 5 minutes TTL
  );

  // Get user by ID
  const user = await LocalJsonHelper.getById('users/active_users.json', 'user_id', 123);
  console.log('User:', user);
  // Output: { value: {...}, createdAt: '2025-11-23', updatedAt: '2025-11-23', ... }

  // Get all users
  const allUsers = await LocalJsonHelper.getAll('users/active_users.json');
  console.log('All users:', allUsers.data);
}

// Example 2: Bulk Data with Array Operations
async function example2_BulkOperations() {
  const users = [
    { user_id: 1, name: 'Alice', role: 'admin' },
    { user_id: 2, name: 'Bob', role: 'user' },
    { user_id: 3, name: 'Charlie', role: 'user' }
  ];

  // Add multiple users
  for (const user of users) {
    await LocalJsonHelper.set('users/all_users.json', 'user_id', user);
  }

  // Get all users with specific role
  const admins = await LocalJsonHelper.getAllByField('users/all_users.json', 'role', 'admin');
  console.log('Admins:', admins.values);
}

// Example 3: Session Management with TTL
async function example3_SessionManagement() {
  const session = {
    session_id: 'sess_abc123',
    user_id: 456,
    token: 'jwt_token_here',
    created_at: Date.now()
  };

  // Store session with 30 minute expiry
  await LocalJsonHelper.set(
    'sessions/active_sessions.json',
    'session_id',
    session,
    30 * 60 * 1000 // 30 minutes
  );

  // Check session status
  const sessionData = await LocalJsonHelper.getById(
    'sessions/active_sessions.json',
    'session_id',
    'sess_abc123'
  );
  console.log('Session expires in:', sessionData.remainingMs);
}

// Example 4: Remove Operations
async function example4_RemoveOperations() {
  // Remove a specific user
  const removed = await LocalJsonHelper.remove('users/all_users.json', 'user_id', 123);
  console.log('User removed:', removed); // true or false

  // Delete entire file
  await LocalJsonHelper.deleteFullFile('sessions/old_sessions.json');
}

// Example 5: Check Data Status and Cache Info
async function example5_StatusCheck() {
  const status = await LocalJsonHelper.checkDataStatus('users/all_users.json');
  console.log('File status:', status);
  /* Output:
  {
    exists: true,
    expired: false,
    totalCount: 450,
    size_mb: 0.85,
    is_cached: true,
    should_cache: true
  }
  */
}

// Example 6: Cache Statistics and Management
async function example6_CacheManagement() {
  // Get cache statistics
  const stats = LocalJsonHelper.getCacheStats();
  console.log('Cache Stats:', JSON.stringify(stats, null, 2));
  /* Output:
  {
    "size": 15,
    "max_entries_threshold": 1000,
    "max_file_size_mb": 1,
    "total_size_mb": 0.45,
    "hits": 1250,
    "misses": 50,
    "hit_rate": 0.96,
    "cached_tables": {
      "users/active_users.json": {
        "size_mb": 0.12,
        "entries": 450,
        "cached_at": "2025-11-23T10:30:00.000Z",
        "expires_at": "2025-11-23T10:35:00.000Z"
      }
    }
  }
  */

  // Update cache configuration
  LocalJsonHelper.updateCacheConfig({
    MAX_ENTRIES_FOR_MEMORY: 2000,
    MAX_FILE_SIZE_MB: 2,
    ENABLE_MEMORY_CACHE: true
  });

  // Clear all cache if needed
  LocalJsonHelper.clearCache();
}

// Example 7: Real-World Dashboard Data (like your use case)
async function example7_DashboardData() {
  const dashboardData = {
    total_ngo: 150,
    total_request: 5000,
    total_users: 10000,
    total_request_pending: 250,
    total_request_approved: 4500,
    total_request_rejected: 250,
    timestamp: Date.now()
  };

  // Store dashboard data (will be cached automatically if small enough)
  await LocalJsonHelper.set(
    'dashboard/ngo_stats.json',
    null, // No key means full replace
    dashboardData,
    600000 // 10 minutes cache
  );

  // Retrieve dashboard data (from cache if available)
  const data = await LocalJsonHelper.getAll('dashboard/ngo_stats.json');
  console.log('Dashboard Data:', data.data);
  console.log('Cache hit rate:', LocalJsonHelper.getCacheStats().hit_rate);
}

// Example 8: NGO-Specific Data
async function example8_NgoSpecificData() {
  const ngoId = 'ngo_123';
  
  // Store NGO requests
  const request = {
    request_id: 'req_001',
    ngo_id: ngoId,
    status: 'pending',
    amount: 50000,
    created_at: Date.now()
  };

  await LocalJsonHelper.set(
    `ngo/${ngoId}/requests.json`,
    'request_id',
    request,
    3600000 // 1 hour
  );

  // Get all requests for this NGO
  const ngoRequests = await LocalJsonHelper.getAllByField(
    `ngo/${ngoId}/requests.json`,
    'status',
    'pending'
  );
  console.log('Pending requests:', ngoRequests.values);
}

// Example 9: Parallel Operations for Performance
async function example9_ParallelOperations() {
  // Execute multiple reads in parallel
  const [users, sessions, dashboard] = await Promise.all([
    LocalJsonHelper.getAll('users/all_users.json'),
    LocalJsonHelper.getAll('sessions/active_sessions.json'),
    LocalJsonHelper.getAll('dashboard/ngo_stats.json')
  ]);

  console.log('All data loaded in parallel:', {
    userCount: users.data?.length || 0,
    sessionCount: sessions.data?.length || 0,
    dashboardData: dashboard.data
  });
}

// Example 10: Error Handling Best Practices
async function example10_ErrorHandling() {
  try {
    const result = await LocalJsonHelper.set(
      'users/test.json',
      'user_id',
      { user_id: 999, name: 'Test User' }
    );

    if (result) {
      console.log('Data saved successfully');
      
      // Verify it was cached
      const status = await LocalJsonHelper.checkDataStatus('users/test.json');
      if (status.is_cached) {
        console.log('✓ Data is cached for fast access');
      } else {
        console.log('⚠ Data too large for cache, using file storage');
      }
    }
  } catch (error) {
    console.error('Error saving data:', error);
    // Handle error appropriately
  }
}
