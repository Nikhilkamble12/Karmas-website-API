// /**
//  * Fixed High-Performance Local JSON Cache System (Node.js - ES6 Modules)
//  */

// import { promises as fs } from 'fs';
// import fsSync from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// // ⚠️ Ensure this path is correct for your project structure
// import db from "../../services/index.js"; 
// import { QueryTypes } from 'sequelize';
// // ⚠️ Ensure this path is correct
// import TABLE_VIEW_FOLDER_MAP from '../constants/id_constant/local.json.constant.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ==========================================
// // CONFIGURATION
// // ==========================================
// export class CacheConfig {
//     static MAX_ENTRIES_FOR_MEMORY = 2000;
//     static MAX_FILE_SIZE_MB = 3.0;
//     static MAX_ENTRIES_FOR_COUNTER_UPDATES = 1000;
//     static COUNTER_UPDATE_INTERVAL = 10;
//     static USE_METADATA_FILES = true;
//     static DB_QUERY_TIMEOUT = 30000;
//     static ENABLE_DB_OPERATIONS = true;
// }

// // ==========================================
// // MEMORY CACHE
// // ==========================================
// export class MemoryCache {
//     constructor(maxSize = 100, ttlSeconds = 3600) {
//         this._cache = new Map();
//         this._accessTimes = new Map();
//         this._cacheSizes = new Map();
//         this.maxSize = maxSize;
//         this.ttlSeconds = ttlSeconds;
//     }

//     _estimateSizeBytes(data) {
//         try {
//             const jsonStr = JSON.stringify(data);
//             return Buffer.byteLength(jsonStr, 'utf-8');
//         } catch (error) {
//             const dataList = data.data || [];
//             return dataList.length * 500;
//         }
//     }

//     _isCacheable(data) {
//         const dataList = data.data || [];
//         const dataLength = dataList.length;

//         if (dataLength >= CacheConfig.MAX_ENTRIES_FOR_MEMORY) {
//             return {
//                 cacheable: false,
//                 reason: `too_many_entries(${dataLength}>=${CacheConfig.MAX_ENTRIES_FOR_MEMORY})`
//             };
//         }

//         const estimatedSize = this._estimateSizeBytes(data);
//         const maxSizeBytes = CacheConfig.MAX_FILE_SIZE_MB * 1024 * 1024;

//         if (estimatedSize >= maxSizeBytes) {
//             const sizeMb = (estimatedSize / (1024 * 1024)).toFixed(2);
//             return {
//                 cacheable: false,
//                 reason: `too_large(${sizeMb}MB>=${CacheConfig.MAX_FILE_SIZE_MB}MB)`
//             };
//         }

//         return { cacheable: true, reason: 'cacheable' };
//     }

//     get(key) {
//         if (!this._cache.has(key)) return null;

//         const now = Date.now() / 1000;
//         const accessTime = this._accessTimes.get(key) || 0;

//         if (now - accessTime > this.ttlSeconds) {
//             this.invalidate(key);
//             return null;
//         }

//         this._accessTimes.set(key, now);
//         return this._cache.get(key);
//     }

//     set(key, value) {
//         const { cacheable, reason } = this._isCacheable(value);

//         if (!cacheable) {
//             this.invalidate(key);
//             return { cached: false, reason };
//         }

//         // Eviction Policy (LRU)
//         if (this._cache.size >= this.maxSize && !this._cache.has(key)) {
//             if (this._accessTimes.size > 0) {
//                 let oldestKey = this._accessTimes.keys().next().value;
//                 let oldestTime = Infinity;
                
//                 for (const [k, time] of this._accessTimes.entries()) {
//                     if (time < oldestTime) {
//                         oldestTime = time;
//                         oldestKey = k;
//                     }
//                 }

//                 if (oldestKey) this.invalidate(oldestKey);
//             }
//         }

//         const estimatedSize = this._estimateSizeBytes(value);
//         this._cache.set(key, value);
//         this._accessTimes.set(key, Date.now() / 1000);
//         this._cacheSizes.set(key, estimatedSize);

//         const sizeMb = (estimatedSize / (1024 * 1024)).toFixed(2);
//         console.log(`✅ Cached ${key}: ${(value.data || []).length} entries, ${sizeMb}MB`);

//         return { cached: true, reason: `cached` };
//     }

//     invalidate(key) {
//         this._cache.delete(key);
//         this._accessTimes.delete(key);
//         this._cacheSizes.delete(key);
//     }

//     clear() {
//         this._cache.clear();
//         this._accessTimes.clear();
//         this._cacheSizes.clear();
//     }

//     getStats() {
//         return { size: this._cache.size }; 
//     }
// }

// const _memoryCache = new MemoryCache(50, 1800);

// // ==========================================
// // INDEX MANAGER
// // ==========================================
// export class IndexManager {
//     constructor() { this._indexes = new Map(); }
//     buildIndex(tableName, keyName, data) {
//         if (!Array.isArray(data)) return;
//         const index = new Map();
//         for (const item of data) {
//             if (item && item[keyName] !== undefined) index.set(item[keyName], item);
//         }
//         if (!this._indexes.has(tableName)) this._indexes.set(tableName, new Map());
//         this._indexes.get(tableName).set(keyName, index);
//     }
//     lookup(tableName, keyName, keyValue) {
//         return this._indexes.get(tableName)?.get(keyName)?.get(keyValue) || null;
//     }
//     batchLookup(tableName, keyName, keyValues) {
//         const index = this._indexes.get(tableName)?.get(keyName);
//         if (!index) return [];
//         return keyValues.map(kv => index.get(kv)).filter(item => item !== undefined);
//     }
//     invalidate(tableName) { this._indexes.delete(tableName); }
//     clear() { this._indexes.clear(); }
// }
// const _indexManager = new IndexManager();

// // ==========================================
// // METADATA MANAGER
// // ==========================================
// export class MetadataManager {
//     static _getMetadataPath(dataFilePath) {
//         const parsed = path.parse(dataFilePath);
//         return path.join(parsed.dir, `${parsed.name}.meta.json`);
//     }
//     static async loadMetadata(dataFilePath) {
//         if (!CacheConfig.USE_METADATA_FILES) return null;
//         try {
//             const metaPath = this._getMetadataPath(dataFilePath);
//             if (!fsSync.existsSync(metaPath)) return null;
//             return JSON.parse(await fs.readFile(metaPath, 'utf-8'));
//         } catch (e) { return null; }
//     }
//     static async saveMetadata(dataFilePath, metadata) {
//         if (!CacheConfig.USE_METADATA_FILES) return;
//         try {
//             await fs.writeFile(this._getMetadataPath(dataFilePath), JSON.stringify(metadata, null, 2), 'utf-8');
//         } catch (e) { console.error("Meta save failed", e.message); }
//     }
//     static extractMetadata(data) {
//         return {
//             name: data.name, view_name: data.view_name,
//             created_at: data.created_at, modified_at: data.modified_at,
//             expiry_at: data.expiry_at, db_count_check_counter: data.db_count_check_counter,
//             data_length: (data.data || []).length
//         };
//     }
//     static mergeMetadata(data, metadata) {
//         return { ...data, ...metadata };
//     }
// }

// // ==========================================
// // DATABASE HELPER (FIXED REGEX)
// // ==========================================
// export class DatabaseHelper {
//     static isValidViewName(viewName) {
//         if (!viewName || typeof viewName !== 'string') return false;
        
//         const trimmed = viewName.trim();
//         if (trimmed.length === 0) return false;
        
//         // ✅ FIX: Separated character class [] and double-dash --
//         // This prevents the "Range out of order" error
//         const dangerousPatterns = /[;'"\\]|--/;
        
//         if (dangerousPatterns.test(trimmed)) {
//             console.error(`❌ Invalid view_name detected (potential SQL injection): ${viewName}`);
//             return false;
//         }
        
//         return true;
//     }

//     static async getDbCount(viewName) {
//         if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return null;
//         try {
//             const result = await db.sequelize.query(`SELECT COUNT(*) as count FROM ${viewName}`, {
//                 type: QueryTypes.SELECT, timeout: CacheConfig.DB_QUERY_TIMEOUT, raw: true
//             });
//             return parseInt(result[0]?.count || 0, 10);
//         } catch (e) { return null; }
//     }

//     static async fetchAllFromDb(viewName) {
//         if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return [];
//         try {
//             return await db.sequelize.query(`SELECT * FROM ${viewName}`, {
//                 type: QueryTypes.SELECT, timeout: CacheConfig.DB_QUERY_TIMEOUT, raw: true
//             }) || [];
//         } catch (e) { console.error(`DB Fetch Error ${viewName}:`, e.message); return []; }
//     }

//     static async testConnection() {
//         try { await sequelize.authenticate(); return true; } catch { return false; }
//     }
// }

// // ==========================================
// // OPTIMIZED LOCAL JSON DB (FINAL)
// // ==========================================
// export class OptimizedLocalJsonDB {
//     // Go up two levels (../../) to reach 'server', then into 'resources/json'
//     static _BASE_PATH = path.join(__dirname, '../../resources/json');
//     static _WRITE_QUEUE = new Map();
//     static _PENDING_WRITES = 0;
//     static _REQUEST_COUNTERS = new Map();
//     static _FILE_LOCKS = new Map();
//     static _writeTimeout = null;

//     constructor(configOrName, expiryDays = 15) {
//         let mapping;
        
//         if (typeof configOrName === 'string') {
//             if (!TABLE_VIEW_FOLDER_MAP || !TABLE_VIEW_FOLDER_MAP[configOrName]) {
//                 throw new Error(`❌ Unknown table '${configOrName}' in TABLE_VIEW_FOLDER_MAP`);
//             }
//             mapping = TABLE_VIEW_FOLDER_MAP[configOrName];
//             this.tableName = configOrName;
//         } 
//         else if (typeof configOrName === 'object' && configOrName !== null) {
//             mapping = configOrName;
//             const fileName = mapping.json_file_name || mapping.file_name || 'unknown.json';
//             this.tableName = mapping.name || `${mapping.folder_name || 'root'}/${fileName}`;
//         } 
//         else {
//             throw new Error('❌ Invalid constructor argument');
//         }

//         this.viewName = mapping.view_name || null;
//         this.folderName = mapping.folder_name || this.tableName;
//         let jsonFileName = mapping.json_file_name || mapping.file_name || `${this.tableName}.json`;
//         this.jsonFileName = jsonFileName.replace('.json5', '.json');
//         this.expiryDays = expiryDays;

//         this.hasValidViewName = DatabaseHelper.isValidViewName(this.viewName);
//         if (!this.viewName) this.hasValidViewName = false;

//         const folderPath = path.join(OptimizedLocalJsonDB._BASE_PATH, this.folderName);
//         if (!fsSync.existsSync(folderPath)) {
//             try { fsSync.mkdirSync(folderPath, { recursive: true }); } catch (e) {}
//         }
//         this.filePath = path.join(folderPath, this.jsonFileName);
//         this._cacheKey = `${this.tableName}:${expiryDays}`;
//     }

//     static _getInstance(tableRef, expiryDays) {
//         return new OptimizedLocalJsonDB(tableRef, expiryDays);
//     }

//     async _loadFromMemoryOrFile() {
//         const cached = _memoryCache.get(this._cacheKey);
//         if (cached) return cached;
//         if (!fsSync.existsSync(this.filePath)) return null;
//         try {
//             const content = await fs.readFile(this.filePath, 'utf-8');
//             let data = JSON.parse(content);
//             const metadata = await MetadataManager.loadMetadata(this.filePath);
//             if (metadata) data = MetadataManager.mergeMetadata(data, metadata);
//             _memoryCache.set(this._cacheKey, data);
//             return data;
//         } catch (error) { return null; }
//     }

//     async _saveLazy(data, force, metadataOnly) {
//          const dataLength = (data.data || []).length;
//          const isLarge = dataLength >= CacheConfig.MAX_ENTRIES_FOR_COUNTER_UPDATES;
//          if (isLarge && metadataOnly) {
//              const metadata = MetadataManager.extractMetadata(data);
//              await MetadataManager.saveMetadata(this.filePath, metadata);
//              return;
//          }
//          const { cached } = _memoryCache.set(this._cacheKey, data);
//          if (!cached) {
//              try {
//                 await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
//                 await MetadataManager.saveMetadata(this.filePath, MetadataManager.extractMetadata(data));
//              } catch(e) {}
//              return;
//          }
//          OptimizedLocalJsonDB._WRITE_QUEUE.set(this._cacheKey, {
//              filePath: this.filePath, data: data, timestamp: Date.now()
//          });
//          OptimizedLocalJsonDB._PENDING_WRITES++;
//          if (force || OptimizedLocalJsonDB._PENDING_WRITES >= 5) await OptimizedLocalJsonDB._flushWriteQueue();
//          else this._scheduleFlush();
//     }
    
//     _scheduleFlush() {
//         if (OptimizedLocalJsonDB._writeTimeout) clearTimeout(OptimizedLocalJsonDB._writeTimeout);
//         OptimizedLocalJsonDB._writeTimeout = setTimeout(async () => await OptimizedLocalJsonDB._flushWriteQueue(), 5000);
//     }

//     static async _flushWriteQueue() {
//         if (this._WRITE_QUEUE.size === 0) return;
//         for (const [key, val] of this._WRITE_QUEUE.entries()) {
//             try { await fs.writeFile(val.filePath, JSON.stringify(val.data, null, 2), 'utf-8'); } catch (e) {}
//         }
//         this._WRITE_QUEUE.clear();
//         this._PENDING_WRITES = 0;
//     }

//     _isExpired(data) {
//         try { return new Date() >= new Date(data.expiry_at); } catch { return true; }
//     }

//     async _getDbCount() {
//         if (!this.hasValidViewName) return null;
//         return await DatabaseHelper.getDbCount(this.viewName);
//     }

//     async _fetchFullFromDb() {
//         if (!this.hasValidViewName) return [];
//         return await DatabaseHelper.fetchAllFromDb(this.viewName);
//     }

//     async _needsRefresh(data) {
//         if (this._isExpired(data)) return { needs: true, reason: 'expired' };
//         if (!this.hasValidViewName) return { needs: false, reason: 'no_view' };
        
//         const counter = data.db_count_check_counter || 0;
//         if (counter <= 0) {
//             const dbCount = await this._getDbCount();
//             if (dbCount === null) return { needs: false, reason: 'db_fail' };
//             const localCount = (data.data || []).length;
//             if (dbCount !== localCount) return { needs: true, reason: 'count_mismatch' };
//         }
//         return { needs: false, reason: 'valid' };
//     }

//     _createCacheStructure(freshData) {
//         const now = new Date();
//         const expiry = new Date(now.getTime() + this.expiryDays * 24 * 60 * 60 * 1000);
//         return {
//             name: this.tableName, view_name: this.viewName,
//             created_at: now.toISOString(), modified_at: now.toISOString(),
//             expiry_at: expiry.toISOString(), db_count_check_counter: 15,
//             data: freshData
//         };
//     }

//     // ==========================================
//     // STATIC API
//     // ==========================================

//     static async getAll(tableRef, expiryDays = 15, filterField = null, filterValue = null) {
//         const instance = this._getInstance(tableRef, expiryDays);
//         let data = await instance._loadFromMemoryOrFile();

//         if (!data) {
//             if (!instance.hasValidViewName) return [];
//             const freshData = await instance._fetchFullFromDb();
//             if (freshData.length === 0) return [];
            
//             data = instance._createCacheStructure(freshData);
//             await instance._saveLazy(data, true);
//             _indexManager.buildIndex(instance.tableName, 'id', freshData);
            
//             if (filterField !== null) return this._filterList(freshData, filterField, filterValue);
//             return freshData;
//         }

//         const { needs } = await instance._needsRefresh(data);
//         if (needs) {
//             const freshData = await instance._fetchFullFromDb();
//             if (freshData.length > 0) {
//                 data.data = freshData;
//                 data.modified_at = new Date().toISOString();
//                 data.db_count_check_counter = 15;
//                 await instance._saveLazy(data, true);
//                 _indexManager.buildIndex(instance.tableName, 'id', freshData);
//             }
//         } else {
//              const isLarge = (data.data || []).length >= CacheConfig.MAX_ENTRIES_FOR_COUNTER_UPDATES;
//              data.db_count_check_counter = (data.db_count_check_counter || 15) - 1;
             
//              if (isLarge) {
//                  const key = `${instance._cacheKey}:req`;
//                  let reqs = (this._REQUEST_COUNTERS.get(key) || 0) + 1;
//                  this._REQUEST_COUNTERS.set(key, reqs);
//                  if (reqs % CacheConfig.COUNTER_UPDATE_INTERVAL === 0) await instance._saveLazy(data, false, true);
//              } else {
//                  await instance._saveLazy(data, false);
//              }
//         }

//         if (!_indexManager.lookup(instance.tableName, 'id', 1)) {
//             _indexManager.buildIndex(instance.tableName, 'id', data.data);
//         }

//         if (filterField !== null) return this._filterList(data.data, filterField, filterValue);
//         return data.data;
//     }

//     static _filterList(data, field, value) {
//         if (!Array.isArray(data)) return [];
//         const target = typeof value === 'boolean' ? Number(value) : value;
//         return data.filter(i => i && i[field] !== undefined && (typeof i[field] === 'boolean' ? Number(i[field]) : i[field]) === target);
//     }

//     static async getByKey(tableRef, keyName, keyValue, expiryDays = 15, filterField = null, filterValue = null) {
//         const instance = this._getInstance(tableRef, expiryDays);
//         let result = _indexManager.lookup(instance.tableName, keyName, keyValue);
        
//         if (!result) {
//             const all = await this.getAll(tableRef, expiryDays);
//             if (all.length > 0) result = _indexManager.lookup(instance.tableName, keyName, keyValue);
//         }

//         if (result && filterField !== null) {
//             const target = typeof filterValue === 'boolean' ? Number(filterValue) : filterValue;
//             if (!this._matchesFilter(result, filterField, target)) return null;
//         }
//         return result;
//     }

//     static _matchesFilter(item, field, target) {
//         if (!item || item[field] === undefined) return false;
//         return (typeof item[field] === 'boolean' ? Number(item[field]) : item[field]) === target;
//     }

//     static async getByKeysBatch(tableRef, keyName, keyValues, expiryDays = 15, filterField = null, filterValue = null) {
//         const instance = this._getInstance(tableRef, expiryDays);
//         await this.getAll(tableRef, expiryDays);
//         let results = _indexManager.batchLookup(instance.tableName, keyName, keyValues);
//         if (filterField !== null) results = this._filterList(results, filterField, filterValue);
//         return results;
//     }

//     static async save(tableRef, dataEntry = null, keyName = null, keyValue = null, newFile = false, expiryDays = 15) {
//         const instance = this._getInstance(tableRef, expiryDays);
        
//         if (this._FILE_LOCKS.get(instance._cacheKey)) {
//              await new Promise(r => setTimeout(r, 100));
//         }
//         this._FILE_LOCKS.set(instance._cacheKey, true);

//         try {
//             let data = await instance._loadFromMemoryOrFile();
//             const now = new Date();

//             if (!data) data = instance._createCacheStructure([]);
            
//             if (instance._isExpired(data) && instance.hasValidViewName) {
//                 const fresh = await instance._fetchFullFromDb();
//                 if(fresh.length > 0) {
//                      data.data = fresh;
//                      data.expiry_at = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
//                 }
//             }

//             if (newFile) {
//                 data.data = Array.isArray(dataEntry) ? dataEntry : [];
//             } else {
//                 if (!dataEntry || !keyName || keyValue === undefined) throw new Error('Invalid upsert params');
//                 if (!Array.isArray(data.data)) data.data = [];
                
//                 const idx = data.data.findIndex(i => i[keyName] === keyValue);
//                 if (idx >= 0) data.data[idx] = dataEntry;
//                 else data.data.push(dataEntry);
//             }

//             data.modified_at = now.toISOString();
//             await instance._saveLazy(data, true);
//             _indexManager.invalidate(instance.tableName);
            
//             return data;
//         } finally {
//             this._FILE_LOCKS.delete(instance._cacheKey);
//         }
//     }

//     static async deleteEntry(tableRef, keyName, keyValue, expiryDays = 15) {
//         const instance = this._getInstance(tableRef, expiryDays);
//         const data = await instance._loadFromMemoryOrFile();
//         if (!data || !Array.isArray(data.data)) return false;

//         const originalLen = data.data.length;
//         data.data = data.data.filter(e => e && e[keyName] !== keyValue);
        
//         if (data.data.length !== originalLen) {
//             data.modified_at = new Date().toISOString();
//             await instance._saveLazy(data, true);
//             _indexManager.invalidate(instance.tableName);
//             return true;
//         }
//         return false;
//     }

//     // 🆕 NEW METHOD: Get File Status
//     static async getFileStatus(tableRef, expiryDays = 15) {
//         try {
//             const instance = this._getInstance(tableRef, expiryDays);
//             const inMemory = _memoryCache.get(instance._cacheKey) !== null;
//             const fileExists = fsSync.existsSync(instance.filePath);
            
//             let stats = null;
//             if (fileExists) {
//                 const fileStats = await fs.stat(instance.filePath);
//                 stats = {
//                     size_bytes: fileStats.size,
//                     size_mb: (fileStats.size / (1024 * 1024)).toFixed(2),
//                     modified_at: fileStats.mtime
//                 };
//             }

//             return {
//                 table_name: instance.tableName,
//                 file_path: instance.filePath,
//                 exists: fileExists,
//                 in_memory: inMemory,
//                 stats: stats
//             };
//         } catch (error) {
//             return {
//                 error: error.message,
//                 exists: false
//             };
//         }
//     }

//     // 🆕 NEW METHOD: Deletes a single file (Alias for invalidate)
//     static async deleteFile(tableRef) {
//         return await this.invalidate(tableRef);
//     }

//     // 🆕 NEW METHOD: Clears EVERYTHING (Memory + Files)
//     static async clearAll() {
//         // 1. Clear In-Memory
//         _memoryCache.clear();
//         _indexManager.clear();
//         this._REQUEST_COUNTERS.clear();
//         this._WRITE_QUEUE.clear();
//         this._FILE_LOCKS.clear();
        
//         // 2. Clear File System
//         try {
//             if (fsSync.existsSync(this._BASE_PATH)) {
//                  await fs.rm(this._BASE_PATH, { recursive: true, force: true });
//                  await fs.mkdir(this._BASE_PATH, { recursive: true });
//             }
//             console.log('🧹 CLEARED ALL CACHE AND FILES');
//             return true;
//         } catch(error) {
//             console.error('❌ Failed to clear all cache:', error.message);
//             return false;
//         }
//     }

//     static async invalidate(tableRef, expiryDays = 15) {
//         const instance = this._getInstance(tableRef, expiryDays);
//         _memoryCache.invalidate(instance._cacheKey);
//         _indexManager.invalidate(instance.tableName);
        
//         try {
//              if (fsSync.existsSync(instance.filePath)) await fs.unlink(instance.filePath);
//              const meta = MetadataManager._getMetadataPath(instance.filePath);
//              if (fsSync.existsSync(meta)) await fs.unlink(meta);
//              console.log(`🗑️ Deleted file: ${instance.tableName}`);
//         } catch(e) {}
//     }
// }

// export const LocalJsonDB = OptimizedLocalJsonDB;
// export default OptimizedLocalJsonDB;


/**
 * Enhanced High-Performance Local JSON Cache System (Node.js - ES6 Modules)
 */

import { promises as fs } from 'fs';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from "../../services/index.js"; 
import { QueryTypes } from 'sequelize';
import TABLE_VIEW_FOLDER_MAP from '../constants/id_constant/local.json.constant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// TIME PARSER UTILITY
// ==========================================
export class TimeParser {
    static parseToMs(timeExpression) {
        if (typeof timeExpression === 'number') return timeExpression * 24 * 60 * 60 * 1000;
        if (!timeExpression || typeof timeExpression !== 'string') return 15 * 24 * 60 * 60 * 1000; 

        let totalMs = 0;
        const parts = timeExpression.split(',').map(p => p.trim());

        for (const part of parts) {
            const monthMatch = part.match(/^(\d+)\s*mn$/i);
            const dayMatch = part.match(/^(\d+)\s*d$/i);
            const hourMatch = part.match(/^(\d+)\s*h$/i);
            const minuteMatch = part.match(/^(\d+)\s*m$/i);

            if (monthMatch) totalMs += parseInt(monthMatch[1]) * 30 * 24 * 60 * 60 * 1000;
            else if (dayMatch) totalMs += parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000;
            else if (hourMatch) totalMs += parseInt(hourMatch[1]) * 60 * 60 * 1000;
            else if (minuteMatch) totalMs += parseInt(minuteMatch[1]) * 60 * 1000;
        }
        return totalMs > 0 ? totalMs : 15 * 24 * 60 * 60 * 1000;
    }

    static msToReadable(ms) {
        const months = Math.floor(ms / (30 * 24 * 60 * 60 * 1000));
        ms %= (30 * 24 * 60 * 60 * 1000);
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        ms %= (24 * 60 * 60 * 1000);
        const hours = Math.floor(ms / (60 * 60 * 1000));
        ms %= (60 * 60 * 1000);
        const minutes = Math.floor(ms / (60 * 1000));

        const parts = [];
        if (months > 0) parts.push(`${months}mn`);
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        return parts.length > 0 ? parts.join(',') : '0m';
    }
}

// ==========================================
// CONFIGURATION
// ==========================================
export class CacheConfig {
    static MAX_ENTRIES_FOR_MEMORY = 2000;
    static MAX_FILE_SIZE_MB = 3.0;
    static MAX_ENTRIES_FOR_COUNTER_UPDATES = 1000;
    static COUNTER_UPDATE_INTERVAL = 10;
    static USE_METADATA_FILES = true;
    static DB_QUERY_TIMEOUT = 30000;
    static ENABLE_DB_OPERATIONS = true;
    static INITIAL_DB_COUNT_CHECK_COUNTER = 15;
}

// ==========================================
// MEMORY CACHE
// ==========================================
export class MemoryCache {
    constructor(maxSize = 100, ttlSeconds = 3600) {
        this._cache = new Map();
        this._accessTimes = new Map();
        this._cacheSizes = new Map();
        this.maxSize = maxSize;
        this.ttlSeconds = ttlSeconds;
    }

    _estimateSizeBytes(data) {
        try {
            const jsonStr = JSON.stringify(data);
            return Buffer.byteLength(jsonStr, 'utf-8');
        } catch (error) {
            const dataValue = data.data || [];
            const dataList = Array.isArray(dataValue) ? dataValue : (typeof dataValue === 'object' ? Object.values(dataValue).flat() : []);
            return dataList.length * 500;
        }
    }

    _isCacheable(data) {
        const dataValue = data.data || [];
        const dataList = Array.isArray(dataValue) ? dataValue : (typeof dataValue === 'object' ? Object.values(dataValue).flat() : []);
        const dataLength = dataList.length;

        if (dataLength >= CacheConfig.MAX_ENTRIES_FOR_MEMORY) {
            return { cacheable: false, reason: `too_many_entries(${dataLength}>=${CacheConfig.MAX_ENTRIES_FOR_MEMORY})` };
        }
        const estimatedSize = this._estimateSizeBytes(data);
        const maxSizeBytes = CacheConfig.MAX_FILE_SIZE_MB * 1024 * 1024;
        if (estimatedSize >= maxSizeBytes) {
            const sizeMb = (estimatedSize / (1024 * 1024)).toFixed(2);
            return { cacheable: false, reason: `too_large(${sizeMb}MB>=${CacheConfig.MAX_FILE_SIZE_MB}MB)` };
        }
        return { cacheable: true, reason: 'cacheable' };
    }

    get(key) {
        if (!this._cache.has(key)) return null;

        const now = Date.now();
        const data = this._cache.get(key);

        if (data.expires_at) {
            const expiryTime = new Date(data.expires_at).getTime();
            if (now >= expiryTime) {
                this.invalidate(key);
                return null;
            }
        }

        this._accessTimes.set(key, now / 1000);
        return data;
    }

    set(key, value) {
        const { cacheable, reason } = this._isCacheable(value);
        if (!cacheable) {
            this.invalidate(key);
            return { cached: false, reason };
        }

        if (this._cache.size >= this.maxSize && !this._cache.has(key)) {
            if (this._accessTimes.size > 0) {
                let oldestKey = this._accessTimes.keys().next().value;
                let oldestTime = Infinity;
                for (const [k, time] of this._accessTimes.entries()) {
                    if (time < oldestTime) {
                        oldestTime = time;
                        oldestKey = k;
                    }
                }
                if (oldestKey) this.invalidate(oldestKey);
            }
        }

        const estimatedSize = this._estimateSizeBytes(value);
        this._cache.set(key, value);
        this._accessTimes.set(key, Date.now() / 1000);
        this._cacheSizes.set(key, estimatedSize);
        const dataValue = value.data || [];
        const dataLength = Array.isArray(dataValue) ? dataValue.length : (typeof dataValue === 'object' ? Object.values(dataValue).flat().length : 0);
        const sizeMb = (estimatedSize / (1024 * 1024)).toFixed(2);
        console.log(`✅ Cached ${key}: ${dataLength} entries, ${sizeMb}MB`);
        return { cached: true, reason: `cached` };
    }

    invalidate(key) {
        this._cache.delete(key);
        this._accessTimes.delete(key);
        this._cacheSizes.delete(key);
    }

    clear() {
        this._cache.clear();
        this._accessTimes.clear();
        this._cacheSizes.clear();
    }

    getStats() { return { size: this._cache.size }; }
}

const _memoryCache = new MemoryCache(50, 1800);

// ==========================================
// INDEX MANAGER
// ==========================================
export class IndexManager {
    constructor() { this._indexes = new Map(); }
    
    buildIndex(tableName, keyName, data) {
        if (!Array.isArray(data)) return;
        const index = new Map();
        for (const item of data) {
            if (item && item[keyName] !== undefined) index.set(item[keyName], item);
        }
        if (!this._indexes.has(tableName)) this._indexes.set(tableName, new Map());
        this._indexes.get(tableName).set(keyName, index);
    }
    
    lookup(tableName, keyName, keyValue) {
        return this._indexes.get(tableName)?.get(keyName)?.get(keyValue) || null;
    }
    
    batchLookup(tableName, keyName, keyValues) {
        const index = this._indexes.get(tableName)?.get(keyName);
        if (!index) return [];
        return keyValues.map(kv => index.get(kv)).filter(item => item !== undefined);
    }
    
    invalidate(tableName) { this._indexes.delete(tableName); }
    clear() { this._indexes.clear(); }
}

const _indexManager = new IndexManager();

// ==========================================
// METADATA MANAGER
// ==========================================
export class MetadataManager {
    static _getMetadataPath(dataFilePath) {
        const parsed = path.parse(dataFilePath);
        return path.join(parsed.dir, `${parsed.name}.meta.json`);
    }

    static async loadMetadata(dataFilePath) {
        if (!CacheConfig.USE_METADATA_FILES) return null;
        try {
            const metaPath = this._getMetadataPath(dataFilePath);
            if (!fsSync.existsSync(metaPath)) return null;
            return JSON.parse(await fs.readFile(metaPath, 'utf-8'));
        } catch (e) { return null; }
    }

    static async saveMetadata(dataFilePath, metadata) {
        if (!CacheConfig.USE_METADATA_FILES) return;
        try {
            await fs.writeFile(this._getMetadataPath(dataFilePath), JSON.stringify(metadata, null, 2), 'utf-8');
        } catch (e) { console.error("Meta save failed", e.message); }
    }

    static extractMetadata(data) {
        return {
            name: data.name,
            view_name: data.view_name,
            created_at: data.created_at,
            updated_at: data.updated_at,
            expires_at: data.expires_at,
            modified_at: data.modified_at,
            ttl_ms: data.ttl_ms,
            db_count_check_counter: data.db_count_check_counter,
            data_length: this._getDataLength(data.data)
        };
    }

    static _getDataLength(data) {
        if (!data) return 0;
        if (Array.isArray(data)) return data.length;
        if (typeof data === 'object' && data !== null) {
            return Object.values(data).reduce((sum, v) => {
                return sum + (Array.isArray(v) ? v.length : 0);
            }, 0);
        }
        return 0;
    }

    static mergeMetadata(data, metadata) { return { ...data, ...metadata }; }
}

// ==========================================
// DATABASE HELPER
// ==========================================
export class DatabaseHelper {
    static isValidViewName(viewName) {
        if (!viewName || typeof viewName !== 'string') return false;
        const trimmed = viewName.trim();
        if (trimmed.length === 0) return false;
        const dangerousPatterns = /[;'"\\]|--/;
        if (dangerousPatterns.test(trimmed)) {
            console.error(`❌ Invalid view_name detected: ${viewName}`);
            return false;
        }
        return true;
    }

    static async getDbCount(viewName) {
        if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return null;
        try {
            const result = await db.sequelize.query(
                `SELECT COUNT(*) as count FROM ${viewName}`, 
                { type: QueryTypes.SELECT, timeout: CacheConfig.DB_QUERY_TIMEOUT, raw: true }
            );
            return parseInt(result[0]?.count || 0, 10);
        } catch (e) { return null; }
    }

    static async fetchAllFromDb(viewName) {
        if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return [];
        try {
            return await db.sequelize.query(
                `SELECT * FROM ${viewName}`, 
                { type: QueryTypes.SELECT, timeout: CacheConfig.DB_QUERY_TIMEOUT, raw: true }
            ) || [];
        } catch (e) { return []; }
    }
}

// ==========================================
// OPTIMIZED LOCAL JSON DB
// ==========================================
export class OptimizedLocalJsonDB {
    static _BASE_PATH = path.join(__dirname, '../../resources/json');
    static _WRITE_QUEUE = new Map();
    static _PENDING_WRITES = 0;
    static _REQUEST_COUNTERS = new Map();
    static _FILE_LOCKS = new Map();
    static _writeTimeout = null;

    constructor(configOrName, expiryTime = "15d") {
        let mapping;
        if (typeof configOrName === 'string') {
            if (!TABLE_VIEW_FOLDER_MAP || !TABLE_VIEW_FOLDER_MAP[configOrName]) throw new Error(`❌ Unknown table '${configOrName}'`);
            mapping = TABLE_VIEW_FOLDER_MAP[configOrName];
            this.tableName = configOrName;
        } 
        else if (typeof configOrName === 'object' && configOrName !== null) {
            mapping = configOrName;
            const fileName = mapping.json_file_name || mapping.file_name || 'unknown.json';
            this.tableName = mapping.name || `${mapping.folder_name || 'root'}/${fileName}`;
        } 
        else throw new Error('❌ Invalid constructor argument');

        this.viewName = mapping.view_name || null;
        this.folderName = mapping.folder_name || this.tableName;
        let jsonFileName = mapping.json_file_name || mapping.file_name || `${this.tableName}.json`;
        this.jsonFileName = jsonFileName.replace('.json5', '.json');
        this.expiryTime = expiryTime;
        this.ttlMs = TimeParser.parseToMs(expiryTime);

        this.hasValidViewName = DatabaseHelper.isValidViewName(this.viewName);
        if (!this.viewName) this.hasValidViewName = false;

        const folderPath = path.join(OptimizedLocalJsonDB._BASE_PATH, this.folderName);
        if (!fsSync.existsSync(folderPath)) {
            try { fsSync.mkdirSync(folderPath, { recursive: true }); } catch (e) {}
        }
        this.filePath = path.join(folderPath, this.jsonFileName);
        this._cacheKey = `${this.tableName}:${expiryTime}`;
    }

    static _getInstance(tableRef, expiryTime) {
        return new OptimizedLocalJsonDB(tableRef, expiryTime);
    }

    async _loadFromMemoryOrFile() {
        const cached = _memoryCache.get(this._cacheKey);
        if (cached) return cached;
        if (!fsSync.existsSync(this.filePath)) return null;
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            let data = JSON.parse(content);
            const metadata = await MetadataManager.loadMetadata(this.filePath);
            if (metadata) data = MetadataManager.mergeMetadata(data, metadata);
            _memoryCache.set(this._cacheKey, data);
            return data;
        } catch (error) { return null; }
    }

    async _saveLazy(data, force, metadataOnly) {
        const dataValue = data.data || [];
        const dataLength = Array.isArray(dataValue) ? dataValue.length : 
                          (typeof dataValue === 'object' ? Object.values(dataValue).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0) : 0);
        const isLarge = dataLength >= CacheConfig.MAX_ENTRIES_FOR_COUNTER_UPDATES;
        
        if (isLarge && metadataOnly) {
            const metadata = MetadataManager.extractMetadata(data);
            await MetadataManager.saveMetadata(this.filePath, metadata);
            return;
        }
        
        const { cached } = _memoryCache.set(this._cacheKey, data);
        if (!cached) {
            try {
                await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
                await MetadataManager.saveMetadata(this.filePath, MetadataManager.extractMetadata(data));
            } catch(e) { console.error(`Failed to save file ${this.filePath}:`, e.message); }
            return;
        }
        
        OptimizedLocalJsonDB._WRITE_QUEUE.set(this._cacheKey, { filePath: this.filePath, data: data, timestamp: Date.now() });
        OptimizedLocalJsonDB._PENDING_WRITES++;
        if (force || OptimizedLocalJsonDB._PENDING_WRITES >= 5) await OptimizedLocalJsonDB._flushWriteQueue();
        else this._scheduleFlush();
    }
    
    _scheduleFlush() {
        if (OptimizedLocalJsonDB._writeTimeout) clearTimeout(OptimizedLocalJsonDB._writeTimeout);
        OptimizedLocalJsonDB._writeTimeout = setTimeout(async () => await OptimizedLocalJsonDB._flushWriteQueue(), 5000);
    }

    static async _flushWriteQueue() {
        if (this._WRITE_QUEUE.size === 0) return;
        for (const [key, val] of this._WRITE_QUEUE.entries()) {
            try { 
                await fs.writeFile(val.filePath, JSON.stringify(val.data, null, 2), 'utf-8');
                await MetadataManager.saveMetadata(val.filePath, MetadataManager.extractMetadata(val.data));
            } catch (e) { console.error(`Failed to flush write for ${key}:`, e.message); }
        }
        this._WRITE_QUEUE.clear();
        this._PENDING_WRITES = 0;
    }

    _isExpired(data) {
        try { 
            if (!data.expires_at) return true;
            const now = Date.now();
            const expiryTime = new Date(data.expires_at).getTime();
            return now >= expiryTime; 
        } catch { return true; }
    }

    async _getDbCount() {
        if (!this.hasValidViewName) return null;
        return await DatabaseHelper.getDbCount(this.viewName);
    }

    async _fetchFullFromDb() {
        if (!this.hasValidViewName) return [];
        return await DatabaseHelper.fetchAllFromDb(this.viewName);
    }

    async _needsRefresh(data) {
        if (this._isExpired(data)) return { needs: true, reason: 'expired' };
        if (!this.hasValidViewName) return { needs: false, reason: 'no_view' };
        
        const counter = data.db_count_check_counter || 0;
        if (counter <= 0) {
            console.log(`🔍 Counter is ${counter}, checking DB count for ${this.viewName}...`);
            const dbCount = await this._getDbCount();
            if (dbCount === null) return { needs: false, reason: 'db_fail' };
            const localLength = MetadataManager._getDataLength(data.data);
            if (dbCount !== localLength) {
                console.log(`⚠️ Count mismatch! DB: ${dbCount}, Local: ${localLength}. Refreshing...`);
                return { needs: true, reason: 'count_mismatch' };
            }
            data.db_count_check_counter = CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER;
        }
        return { needs: false, reason: 'valid' };
    }

    _createCacheStructure(freshData, asObject = false) {
        const now = new Date();
        const expiresAtDate = new Date(now.getTime() + this.ttlMs);
        
        return {
            name: this.tableName,
            view_name: this.viewName || null,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            expires_at: expiresAtDate.toISOString(),
            modified_at: now.toISOString(),
            ttl_ms: this.ttlMs,
            db_count_check_counter: this.hasValidViewName ? CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER : null,
            data: asObject ? freshData : freshData
        };
    }

    // ==========================================
    // STATIC API
    // ==========================================

    static async getAll(tableRef, expiryTime = "15d", filterField = null, filterValue = null) {
        const instance = this._getInstance(tableRef, expiryTime);
        let data = await instance._loadFromMemoryOrFile();

        if (!data) {
            if (!instance.hasValidViewName) return [];
            const freshData = await instance._fetchFullFromDb();
            if (freshData.length === 0) return [];
            
            data = instance._createCacheStructure(freshData);
            await instance._saveLazy(data, true);
            _indexManager.buildIndex(instance.tableName, 'id', freshData);
            
            if (filterField !== null) return this._filterList(freshData, filterField, filterValue);
            return freshData;
        }

        const { needs, reason } = await instance._needsRefresh(data);
        
        if (needs) {
            console.log(`🔄 Refreshing cache for ${instance.tableName} (reason: ${reason})`);
            const freshData = await instance._fetchFullFromDb();
            if (freshData.length > 0) {
                data.data = freshData;
                
                const nowObj = new Date();
                data.modified_at = nowObj.toISOString();
                data.updated_at = nowObj.toISOString();
                data.expires_at = new Date(nowObj.getTime() + instance.ttlMs).toISOString();
                
                data.db_count_check_counter = CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER;
                await instance._saveLazy(data, true);
                _indexManager.buildIndex(instance.tableName, 'id', freshData);
            }
        } else {
            if (instance.hasValidViewName) {
                const dataValue = data.data || [];
                const dataLength = Array.isArray(dataValue) ? dataValue.length : 
                                  (typeof dataValue === 'object' ? Object.values(dataValue).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0) : 0);
                
                const isLarge = dataLength >= CacheConfig.MAX_ENTRIES_FOR_COUNTER_UPDATES;
                data.db_count_check_counter = Math.max(0, (data.db_count_check_counter || CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER) - 1);
                
                if (isLarge) {
                    const key = `${instance._cacheKey}:req`;
                    let reqs = (this._REQUEST_COUNTERS.get(key) || 0) + 1;
                    this._REQUEST_COUNTERS.set(key, reqs);
                    if (reqs % CacheConfig.COUNTER_UPDATE_INTERVAL === 0) await instance._saveLazy(data, false, true);
                } else {
                    await instance._saveLazy(data, false);
                }
            }
        }

        const dataContent = data.data || null;
        if (!dataContent) return [];

        if (Array.isArray(dataContent)) {
            if (dataContent.length > 0 && !_indexManager.lookup(instance.tableName, 'id', dataContent[0]?.id)) {
                _indexManager.buildIndex(instance.tableName, 'id', dataContent);
            }
            if (filterField !== null) return this._filterList(dataContent, filterField, filterValue);
            return dataContent;
        }

        if (typeof dataContent === 'object') return dataContent;
        return [];
    }

    static async save(tableRef, dataEntry = null, keyName = null, keyValue = null, newFile = false, expiryTime = "15d") {
        console.log("🟢 [Start] save() called for:", tableRef);
        if (typeof tableRef !== 'string') {
            console.error("❌ [Failure] Invalid tableRef. Expected string.");
            return;
        }

        const instance = this._getInstance(tableRef, expiryTime);
        if (this._FILE_LOCKS.get(instance._cacheKey)) await new Promise(r => setTimeout(r, 100));
        this._FILE_LOCKS.set(instance._cacheKey, true);

        try {
            let data = await instance._loadFromMemoryOrFile();
            const nowObj = new Date();

            if (!data) {
                data = instance._createCacheStructure([]);
            }
            
            if (instance._isExpired(data) && instance.hasValidViewName) {
                console.log("🔄 Data expired, refreshing from DB...");
                const fresh = await instance._fetchFullFromDb();
                if (fresh.length > 0) {
                    data.data = fresh;
                    data.expires_at = new Date(nowObj.getTime() + instance.ttlMs).toISOString();
                }
            }

            console.log("⚙️ [Step 2] Processing data. newFile mode:", newFile);

            if (newFile) {
                data.data = Array.isArray(dataEntry) ? dataEntry : dataEntry;
            } else {
                if (!dataEntry || !keyName || keyValue === undefined) throw new Error('Invalid upsert params');
                if (!Array.isArray(data.data)) data.data = [];
                const idx = data.data.findIndex(i => i[keyName] === keyValue);
                if (idx >= 0) data.data[idx] = dataEntry;
                else data.data.push(dataEntry);
            }

            data.modified_at = nowObj.toISOString();
            data.updated_at = nowObj.toISOString();

            console.log("💾 [Step 3] Writing to disk...");
            await instance._saveLazy(data, true);
            try { _indexManager.invalidate(instance.tableName); } catch (e) {}
            
            console.log("✅ [Success] Data saved successfully.");
            return data;
        } catch (error) {
            console.error("❌ [Critical Failure] Error inside save():", error);
            throw error;
        } finally {
            this._FILE_LOCKS.delete(instance._cacheKey);
        }
    }

    static async deleteEntry(tableRef, keyName, keyValue, expiryTime = "15d") {
        const instance = this._getInstance(tableRef, expiryTime);
        const data = await instance._loadFromMemoryOrFile();
        if (!data || !Array.isArray(data.data)) return false;

        const originalLen = data.data.length;
        data.data = data.data.filter(e => e && e[keyName] !== keyValue);
        
        if (data.data.length !== originalLen) {
            const nowObj = new Date();
            data.modified_at = nowObj.toISOString();
            data.updated_at = nowObj.toISOString();
            await instance._saveLazy(data, true);
            _indexManager.invalidate(instance.tableName);
            return true;
        }
        return false;
    }

    static _filterList(data, field, value) {
        if (!Array.isArray(data)) return [];
        const target = typeof value === 'boolean' ? Number(value) : value;
        return data.filter(i => i && i[field] !== undefined && (typeof i[field] === 'boolean' ? Number(i[field]) : i[field]) === target);
    }

    static async getByKey(tableRef, keyName, keyValue, expiryTime = "15d", filterField = null, filterValue = null) {
        const instance = this._getInstance(tableRef, expiryTime);
        let result = _indexManager.lookup(instance.tableName, keyName, keyValue);
        if (!result) {
            const all = await this.getAll(tableRef, expiryTime);
            if (all.length > 0) result = _indexManager.lookup(instance.tableName, keyName, keyValue);
        }
        if (result && filterField !== null) {
            const target = typeof filterValue === 'boolean' ? Number(filterValue) : filterValue;
            if (!this._matchesFilter(result, filterField, target)) return null;
        }
        return result;
    }

    static _matchesFilter(item, field, target) {
        if (!item || item[field] === undefined) return false;
        return (typeof item[field] === 'boolean' ? Number(item[field]) : item[field]) === target;
    }

    static async getByKeysBatch(tableRef, keyName, keyValues, expiryTime = "15d", filterField = null, filterValue = null) {
        const instance = this._getInstance(tableRef, expiryTime);
        await this.getAll(tableRef, expiryTime);
        let results = _indexManager.batchLookup(instance.tableName, keyName, keyValues);
        if (filterField !== null) results = this._filterList(results, filterField, filterValue);
        return results;
    }

    static async getFileStatus(tableRef, expiryTime = "15d") {
        try {
            const instance = this._getInstance(tableRef, expiryTime);
            const inMemory = _memoryCache.get(instance._cacheKey) !== null;
            const fileExists = fsSync.existsSync(instance.filePath);
            let stats = null;
            let cacheData = null;
            if (fileExists) {
                const fileStats = await fs.stat(instance.filePath);
                stats = {
                    size_bytes: fileStats.size,
                    size_mb: (fileStats.size / (1024 * 1024)).toFixed(2),
                    modified_at: fileStats.mtime
                };
            }
            if (inMemory) cacheData = _memoryCache.get(instance._cacheKey);

            return {
                table_name: instance.tableName,
                view_name: instance.viewName,
                file_path: instance.filePath,
                exists: fileExists,
                in_memory: inMemory,
                has_view: instance.hasValidViewName,
                db_count_check_counter: cacheData?.db_count_check_counter || null,
                expires_at: cacheData?.expires_at || null, 
                ttl_readable: cacheData?.ttl_ms ? TimeParser.msToReadable(cacheData.ttl_ms) : null,
                stats: stats
            };
        } catch (error) {
            return { error: error.message, exists: false };
        }
    }

    static async deleteFile(tableRef, expiryTime = "15d") {
        return await this.invalidate(tableRef, expiryTime);
    }

    static async clearAll() {
        _memoryCache.clear();
        _indexManager.clear();
        this._REQUEST_COUNTERS.clear();
        this._WRITE_QUEUE.clear();
        this._FILE_LOCKS.clear();
        try {
            if (fsSync.existsSync(this._BASE_PATH)) {
                await fs.rm(this._BASE_PATH, { recursive: true, force: true });
                await fs.mkdir(this._BASE_PATH, { recursive: true });
            }
            console.log('🧹 CLEARED ALL CACHE AND FILES');
            return true;
        } catch(error) {
            console.error('❌ Failed to clear all cache:', error.message);
            return false;
        }
    }

    static async invalidate(tableRef, expiryTime = "15d") {
        const instance = this._getInstance(tableRef, expiryTime);
        _memoryCache.invalidate(instance._cacheKey);
        _indexManager.invalidate(instance.tableName);
        try {
            if (fsSync.existsSync(instance.filePath)) await fs.unlink(instance.filePath);
            const meta = MetadataManager._getMetadataPath(instance.filePath);
            if (fsSync.existsSync(meta)) await fs.unlink(meta);
            console.log(`🗑️ Deleted file: ${instance.tableName}`);
            return true;
        } catch(e) {
            console.error(`Failed to invalidate ${instance.tableName}:`, e.message);
            return false;
        }
    }

    static async getAllCachedTables() {
        const tables = [];
        try {
            if (!fsSync.existsSync(this._BASE_PATH)) return tables;
            const folders = await fs.readdir(this._BASE_PATH);
            for (const folder of folders) {
                const folderPath = path.join(this._BASE_PATH, folder);
                const stats = await fs.stat(folderPath);
                if (stats.isDirectory()) {
                    const files = await fs.readdir(folderPath);
                    for (const file of files) {
                        if (file.endsWith('.json') && !file.endsWith('.meta.json')) {
                            const filePath = path.join(folderPath, file);
                            const fileStats = await fs.stat(filePath);
                            try {
                                const content = await fs.readFile(filePath, 'utf-8');
                                const data = JSON.parse(content);
                                tables.push({
                                    name: data.name || file,
                                    view_name: data.view_name || null,
                                    file_path: filePath,
                                    size_mb: (fileStats.size / (1024 * 1024)).toFixed(2),
                                    modified_at: fileStats.mtime,
                                    expires_at: data.expires_at || null,
                                    is_expired: data.expires_at ? Date.now() >= new Date(data.expires_at).getTime() : false,
                                    db_count_check_counter: data.db_count_check_counter || null,
                                    ttl_readable: data.ttl_ms ? TimeParser.msToReadable(data.ttl_ms) : null,
                                    record_count: MetadataManager._getDataLength(data.data)
                                });
                            } catch (e) {}
                        }
                    }
                }
            }
        } catch (error) { console.error('Failed to get all cached tables:', error.message); }
        return tables;
    }
}

export const LocalJsonDB = OptimizedLocalJsonDB;
export default OptimizedLocalJsonDB;

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// -----------------------------------------------------------------------------
// 1. BASIC LIST CACHING (Arrays)
// -----------------------------------------------------------------------------
// Fetches from DB if missing, caches for 1 day. Returns an Array.
const users = await OptimizedLocalJsonDB.getAll('sos_user_list', '1d'); 

// Filter result directly
const activeUsers = await OptimizedLocalJsonDB.getAll('sos_user_list', '1d', 'status', 1);

// -----------------------------------------------------------------------------
// 2. COMPLEX OBJECT CACHING (Dashboards / Scoreboards)
// -----------------------------------------------------------------------------
// Define your complex object
const dashboardData = {
    topScorers: [ { id: 1, name: 'A' }, { id: 2, name: 'B' } ],
    topLosers: [ { id: 9, name: 'Z' } ],
    metadata: { generated: new Date() }
};

// Save it manually using the 'newFile = true' flag (5th argument)
await OptimizedLocalJsonDB.save(
    'score/daily_leaderboard.json', // tableRef (explicit path or name)
    dashboardData,                  // The Object data
    null,                           // keyName (Not needed for overwrite)
    null,                           // keyValue (Not needed for overwrite)
    true                            // newFile: TRUE = Overwrite/Set Object
);

// Retrieve it later
const cachedBoard = await OptimizedLocalJsonDB.getAll('score/daily_leaderboard.json', '1d');
console.log(cachedBoard.topScorers); // Works!

// -----------------------------------------------------------------------------
// 3. CHECKING FILE STATUS
// -----------------------------------------------------------------------------
const status = await OptimizedLocalJsonDB.getFileStatus('sos_user_list', '1d');
console.log(status);
// Output:
// {
//   table_name: "sos_user_list",
//   exists: true,
//   expires_at: "2025-12-08T17:12:51.119Z", // Now uses standard ISO string
//   ttl_readable: "1d",
//   ...
// }

// -----------------------------------------------------------------------------
// 4. CLEARING CACHE
// -----------------------------------------------------------------------------
// Remove a specific file
await OptimizedLocalJsonDB.deleteFile('sos_user_list', '1d');

// Nuke everything (Reset all caches)
await OptimizedLocalJsonDB.clearAll();
*/