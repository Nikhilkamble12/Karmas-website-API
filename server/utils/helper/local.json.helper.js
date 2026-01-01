/**
 * Enhanced High-Performance Local JSON Cache System (Node.js - ES6 Modules)
 * ✅ Corrected to handle 'conditions' from config
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
        // console.log(`✅ Cached ${key}: ${dataLength} entries, ${sizeMb}MB`);
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
            // ✅ Store conditions in metadata for transparency
            conditions: data.conditions || null,
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

    // ✅ HELPER: Build WHERE clause safely including Boolean support
    static _buildWhereClause(conditions) {
        if (!conditions || typeof conditions !== 'object' || Object.keys(conditions).length === 0) {
            return '';
        }

        const whereClauses = [];
        for (const [key, value] of Object.entries(conditions)) {
            // Validate column name (prevent SQL injection)
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;

            if (value === null) {
                whereClauses.push(`${key} IS NULL`);
            }
            // ✅ HANDLE BOOLEAN (Sequelize/DB often need 1/0 or TRUE/FALSE)
            else if (typeof value === 'boolean') {
                whereClauses.push(`${key} = ${value ? 1 : 0}`);
            }
            else if (typeof value === 'number') {
                whereClauses.push(`${key} = ${value}`);
            } else {
                const escapedValue = String(value).replace(/'/g, "''");
                whereClauses.push(`${key} = '${escapedValue}'`);
            }
        }

        return whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
    }

    static async getDbCount(viewName, conditions = null) {
        if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return null;
        try {
            let query = `SELECT COUNT(*) as count FROM ${viewName}`;
            query += this._buildWhereClause(conditions);

            const result = await db.sequelize.query(
                query,
                { type: QueryTypes.SELECT, timeout: CacheConfig.DB_QUERY_TIMEOUT, raw: true }
            );
            return parseInt(result[0]?.count || 0, 10);
        } catch (e) { return null; }
    }

    static async fetchAllFromDb(viewName, conditions = null) {
        if (!CacheConfig.ENABLE_DB_OPERATIONS || !this.isValidViewName(viewName)) return [];
        try {
            let query = `SELECT * FROM ${viewName}`;
            query += this._buildWhereClause(conditions);

            return await db.sequelize.query(
                query,
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

    // 👇 STATIC PROPERTIES
    static _GROUP_INDEXES = new Map();
    static _REQUEST_COUNTERS = new Map();
    static _FILE_LOCKS = new Map();
    static _writeTimeout = null;

    constructor(configOrName, expiryTime = "15d") {
        let mapping;

        // CASE 1: STRING INPUT
        if (typeof configOrName === 'string') {
            // A. Check if it's a known table from constant MAP
            if (TABLE_VIEW_FOLDER_MAP && TABLE_VIEW_FOLDER_MAP[configOrName]) {
                mapping = TABLE_VIEW_FOLDER_MAP[configOrName];
                this.tableName = configOrName;
            }
            // B. Allow Dynamic/Custom paths (e.g., "score/score_25.json")
            else {
                // Parse dynamic path
                const parts = configOrName.split(/[/\\]/);
                let fileName = parts.pop();

                if (!fileName.endsWith('.json')) fileName += '.json';
                const folderName = parts.length > 0 ? parts.join('/') : 'custom';

                mapping = {
                    folder_name: folderName,
                    json_file_name: fileName,
                    view_name: null,
                    conditions: null // Default for dynamic
                };
                this.tableName = configOrName;
            }
        }
        // CASE 2: OBJECT INPUT
        else if (typeof configOrName === 'object' && configOrName !== null) {
            mapping = configOrName;
            const fileName = mapping.json_file_name || mapping.file_name || 'unknown.json';
            this.tableName = mapping.name || `${mapping.folder_name || 'root'}/${fileName}`;
        }
        else {
            throw new Error('❌ Invalid constructor argument');
        }

        this.viewName = mapping.view_name || null;
        this.folderName = mapping.folder_name || this.tableName;

        // ✅ EXTRACT CONDITIONS
        this.conditions = mapping.conditions || null;

        let jsonFileName = mapping.json_file_name || mapping.file_name || `${this.tableName}.json`;
        this.jsonFileName = jsonFileName.replace('.json5', '.json');

        this.expiryTime = expiryTime;
        this.ttlMs = TimeParser.parseToMs(expiryTime);

        this.hasValidViewName = DatabaseHelper.isValidViewName(this.viewName);
        if (!this.viewName) this.hasValidViewName = false;

        const folderPath = path.join(OptimizedLocalJsonDB._BASE_PATH, this.folderName);
        if (!fsSync.existsSync(folderPath)) {
            try { fsSync.mkdirSync(folderPath, { recursive: true }); } catch (e) { }
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
            } catch (e) { console.error(`Failed to save file ${this.filePath}:`, e.message); }
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
        // ✅ PASS CONDITIONS
        return await DatabaseHelper.getDbCount(this.viewName, this.conditions);
    }

    async _fetchFullFromDb() {
        if (!this.hasValidViewName) return [];
        // ✅ PASS CONDITIONS
        return await DatabaseHelper.fetchAllFromDb(this.viewName, this.conditions);
    }

    async _needsRefresh(data) {
        if (this._isExpired(data)) return { needs: true, reason: 'expired' };
        if (!this.hasValidViewName) return { needs: false, reason: 'no_view' };

        const counter = data.db_count_check_counter || 0;
        if (counter <= 0) {
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
            // ✅ STORE CONDITIONS IN FILE
            conditions: this.conditions,
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

        // 🗑️ EXPIRY CHECK
        if (data && instance._isExpired(data)) {
            console.log(`⏳ [Expiry] Cache expired for ${instance.tableName}. Deleting record...`);
            await this.invalidate(tableRef, expiryTime);
            this._GROUP_INDEXES.forEach((val, key) => {
                if (key.startsWith(`${instance.tableName}:`)) this._GROUP_INDEXES.delete(key);
            });
            data = null;
        }

        // 🔍 DEBUG: Check what was loaded from file
        if (data) {
            // console.log('📂 Loaded from cache - Full structure check:');
            // console.log('   - data.data type:', Array.isArray(data.data) ? 'Array' : typeof data.data);
            // console.log('   - data.data length:', Array.isArray(data.data) ? data.data.length : 'N/A');
            // console.log('   - data keys:', Object.keys(data));
            if (Array.isArray(data.data)) {
                // console.log('   - First 3 items:', data.data.slice(0, 3));
            } else {
                // console.log('   - data.data value:', data.data);
            }
        }

        if (!data) {
            if (!instance.hasValidViewName) return [];
            const freshData = await instance._fetchFullFromDb();

            // // 🔍 DEBUG: Check DB fetch result
            // console.log('🗄️ Fresh DB fetch:');
            // console.log('   - Type:', Array.isArray(freshData) ? 'Array' : typeof freshData);
            // console.log('   - Length:', freshData.length);
            // console.log('   - First item:', freshData[0]);

            if (freshData.length === 0) return [];

            data = instance._createCacheStructure(freshData);

            // // 🔍 DEBUG: Check structure after creation
            // console.log('📦 After _createCacheStructure:');
            // console.log('   - data.data type:', Array.isArray(data.data) ? 'Array' : typeof data.data);
            // console.log('   - data.data length:', Array.isArray(data.data) ? data.data.length : 'N/A');

            await instance._saveLazy(data, true);
            _indexManager.buildIndex(instance.tableName, 'id', freshData);

            if (filterField !== null) return this._filterList(freshData, filterField, filterValue);
            return freshData;
        }

        const { needs, reason } = await instance._needsRefresh(data);

        if (needs) {
            console.log(`🔄 Refreshing cache for ${instance.tableName} (reason: ${reason})`);
            this._GROUP_INDEXES.forEach((val, key) => {
                if (key.startsWith(`${instance.tableName}:`)) this._GROUP_INDEXES.delete(key);
            });

            const freshData = await instance._fetchFullFromDb();
            // // 🔍 DEBUG: Check refresh data
            // console.log('🔄 Refresh DB fetch:');
            // console.log('   - Length:', freshData.length);
            if (freshData.length > 0) {
                data.data = freshData;

                // // 🔍 DEBUG: Verify assignment
                // console.log('   - After assignment, data.data type:', Array.isArray(data.data) ? 'Array' : typeof data.data);
                // console.log('   - After assignment, data.data length:', Array.isArray(data.data) ? data.data.length : 'N/A');


                const nowObj = new Date();
                data.modified_at = nowObj.toISOString();
                data.updated_at = nowObj.toISOString();
                data.expires_at = new Date(nowObj.getTime() + instance.ttlMs).toISOString();
                data.db_count_check_counter = CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER;
                // ✅ UPDATE CONDITIONS ON REFRESH
                data.conditions = instance.conditions;

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


        // // 🔍 DEBUG: Check data structure
        // console.log('📊 Data type:', Array.isArray(dataContent) ? 'Array' : typeof dataContent);
        // console.log('📊 Data length:', Array.isArray(dataContent) ? dataContent.length : 'N/A');
        // console.log('📊 First item:', Array.isArray(dataContent) ? dataContent[0] : dataContent);


        // 🔍 CHECK ACTUAL FILE CONTENT
        // try {
        //     const fileContent = await fs.readFile(instance.filePath, 'utf-8');
        //     const parsedFile = JSON.parse(fileContent);
        //     console.log('📄 Raw File Check:');
        //     console.log('   - File data type:', Array.isArray(parsedFile.data) ? 'Array' : typeof parsedFile.data);
        //     console.log('   - File data length:', Array.isArray(parsedFile.data) ? parsedFile.data.length : 'N/A');
        //     if (Array.isArray(parsedFile.data)) {
        //         console.log('   - Total items in file:', parsedFile.data.length);
        //         console.log('   - First 2 items:', parsedFile.data.slice(0, 2));
        //     }
        // } catch (e) {
        //     console.log('   - Could not read file:', e.message);
        // }

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

    /**
     * Smart Save Method
     */
    // static async save(tableRef, dataEntry = null, keyName = null, keyValue = null, newFile = null, expiryTime = "15d") {
    //     const refLog = typeof tableRef === 'string' ? tableRef : JSON.stringify(tableRef);
    //     console.log(`🟢 [Start] save() called for: ${refLog}`);

    //     if (!tableRef || (typeof tableRef !== 'string' && typeof tableRef !== 'object')) {
    //         throw new Error('Invalid tableRef: must be a string or object');
    //     }

    //     const instance = this._getInstance(tableRef, expiryTime);

    //     // Manage Locks
    //     const lockTimeout = 5000;
    //     const lockStartTime = Date.now();
    //     while (this._FILE_LOCKS.get(instance._cacheKey)) {
    //         if (Date.now() - lockStartTime > lockTimeout) break;
    //         await new Promise(r => setTimeout(r, 50));
    //     }
    //     this._FILE_LOCKS.set(instance._cacheKey, true);

    //     try {
    //         const nowObj = new Date();

    //         if (newFile === true) {
    //             console.log("🗑️ [Explicit New] Deleting old file/cache before processing...");
    //             await this.invalidate(tableRef, expiryTime); 
    //         }

    //         let data = await instance._loadFromMemoryOrFile();

    //         // 🚨 RECOVERY
    //         if (!data && instance.hasValidViewName) {
    //             console.log(`📂 [Recovery] File missing for ${instance.tableName}, fetching from DB...`);
    //             try {
    //                 const freshData = await instance._fetchFullFromDb();
    //                 if (freshData.length > 0) {
    //                     data = instance._createCacheStructure(freshData);
    //                     console.log(`✅ [Recovery] Restored ${freshData.length} records from DB.`);
    //                     if (newFile === null) newFile = false; 
    //                 }
    //             } catch (e) {
    //                 console.warn("⚠️ [Recovery Failed] Could not fetch from DB:", e.message);
    //             }
    //         }

    //         // Fallback: Create empty structure
    //         if (!data) {
    //             console.log("📝 [Init] Creating new empty data structure");
    //             data = instance._createCacheStructure([]); 
    //             if (newFile === null) newFile = true;
    //         }

    //         // 🔍 AUTO-DETECT MODE
    //         if (newFile == null) {
    //             if (instance._isExpired(data)) {
    //                 console.log("🔄 [Auto] Data expired -> REFRESH mode");
    //                 newFile = true; 
    //             } 
    //             else if (instance.hasValidViewName) {
    //                 const dbCount = await instance._getDbCount();
    //                 const localLength = MetadataManager._getDataLength(data.data);
    //                 if (dbCount !== null && dbCount !== localLength) {
    //                     console.log(`🔄 [Auto] Count mismatch -> REFRESH mode`);
    //                     newFile = true;
    //                 } else {
    //                     newFile = false; 
    //                 }
    //             } 
    //             else if (keyName === null && keyValue === null) {
    //                 newFile = true;
    //             } 
    //             else {
    //                 newFile = false;
    //             }
    //         }

    //         // 💾 EXECUTE SAVE LOGIC
    //         if (newFile === true) {
    //             console.log("🆕 [Mode] Overwrite / Refresh");

    //             if (dataEntry === null) {
    //                 if (instance.hasValidViewName) {
    //                     const freshData = await instance._fetchFullFromDb();
    //                     data.data = freshData;
    //                 } else {
    //                     data.data = [];
    //                 }
    //             } else {
    //                 data.data = dataEntry;
    //             }

    //             data.db_count_check_counter = instance.hasValidViewName ? 
    //                 CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER : null;
    //             // Update conditions on refresh
    //             data.conditions = instance.conditions;
    //         } 
    //         else {
    //             console.log("🔄 [Mode] Upsert (Modify specific entry)");
    //             if (dataEntry !== null) {
    //                 if (!Array.isArray(data.data)) data.data = [];
    //                 if (keyName && keyValue !== null) {
    //                     const idx = data.data.findIndex(i => i && String(i[keyName]) === String(keyValue));
    //                     if (idx >= 0) {
    //                         data.data[idx] = dataEntry; 
    //                     } else {
    //                         data.data.push(dataEntry); 
    //                     }
    //                 } else {
    //                     data.data.push(dataEntry);
    //                 }
    //             }
    //         }

    //         // 🏁 FINALIZE
    //         data.modified_at = nowObj.toISOString();
    //         data.updated_at = nowObj.toISOString();

    //         if (newFile === true || instance._isExpired(data)) {
    //             data.expires_at = new Date(nowObj.getTime() + instance.ttlMs).toISOString();
    //         }

    //         await instance._saveLazy(data, true);
    //         try { 
    //             _indexManager.invalidate(instance.tableName);
    //             this._GROUP_INDEXES.clear();
    //         } catch (e) {}

    //         return data;

    //     } catch (error) {
    //         console.error("❌ [Critical Failure] save()", error);
    //         throw error;
    //     } finally {
    //         this._FILE_LOCKS.delete(instance._cacheKey);
    //     }
    // }

    /**
     * Smart Save Method - Final Triple-Checked Version
     * Integrates: Recovery, Locking, Hydration, and Safe Mode Detection
     */
    static async save(tableRef, dataEntry = null, keyName = null, keyValue = null, newFile = null, expiryTime = "15d") {
        // 1. INPUT VALIDATION & LOGGING (Restored from your original)
        const refLog = typeof tableRef === 'string' ? tableRef : JSON.stringify(tableRef);
        console.log(`🟢 [Start] save() called for: ${refLog}`);

        if (!tableRef || (typeof tableRef !== 'string' && typeof tableRef !== 'object')) {
            throw new Error('Invalid tableRef: must be a string or object');
        }

        const instance = this._getInstance(tableRef, expiryTime);

        // 2. CONCURRENCY LOCKING (Restored from your original)
        const lockTimeout = 5000;
        const lockStartTime = Date.now();
        while (this._FILE_LOCKS.get(instance._cacheKey)) {
            if (Date.now() - lockStartTime > lockTimeout) break;
            await new Promise(r => setTimeout(r, 50));
        }
        this._FILE_LOCKS.set(instance._cacheKey, true);

        try {
            const nowObj = new Date();

            // 3. EXPLICIT INVALIDATION (Restored from your original)
            if (newFile === true) {
                console.log("🗑️ [Explicit New] Deleting old file/cache before processing...");
                await this.invalidate(tableRef, expiryTime); 
            }

            let data = await instance._loadFromMemoryOrFile();

            // 4. HYDRATION / RECOVERY (Your robust original logic)
            if (!data && instance.hasValidViewName) {
                console.log(`📂 [Recovery] File missing for ${instance.tableName}, fetching from DB...`);
                try {
                    const freshData = await instance._fetchFullFromDb();
                    if (freshData.length > 0) {
                        data = instance._createCacheStructure(freshData);
                        console.log(`✅ [Recovery] Restored ${freshData.length} records from DB.`);
                        // After recovery, we switch to UPSERT mode unless newFile was explicitly true
                        if (newFile === null) newFile = false; 
                    }
                } catch (e) {
                    console.warn("⚠️ [Recovery Failed] Could not fetch from DB:", e.message);
                }
            }

            // Fallback: Create empty structure
            if (!data) {
                console.log("📝 [Init] Creating new empty data structure");
                data = instance._createCacheStructure([]); 
                if (newFile === null) newFile = true;
            }

            // 5. SMART AUTO-DETECT MODE (The Logic Fix)
            if (newFile === null) {
                if (instance._isExpired(data)) {
                    console.log("🔄 [Auto] Data expired -> REFRESH mode");
                    newFile = true; 
                } 
                else if (instance.hasValidViewName) {
                    const dbCount = await instance._getDbCount();
                    const localLength = MetadataManager._getDataLength(data.data);
                    
                    if (dbCount !== null && dbCount !== localLength) {
                        console.log(`🔄 [Auto] Count mismatch (DB:${dbCount} vs Local:${localLength})`);
                        
                        // CRITICAL FIX: Only go to Refresh mode if we aren't trying to save a single new object.
                        // If we have a single dataEntry, we Upsert it first, then let the counter trigger 
                        // the full refresh on the next 'getAll' to avoid overwriting everything right now.
                        if (dataEntry === null || Array.isArray(dataEntry)) {
                            newFile = true;
                        } else {
                            console.log("👉 Single entry detected. Using Upsert to prevent data loss.");
                            newFile = false;
                        }
                    } else {
                        newFile = false; 
                    }
                } 
                else if (keyName === null && keyValue === null) {
                    newFile = true;
                } 
                else {
                    newFile = false;
                }
            }

            // 6. EXECUTION LOGIC (Restored & Safeguarded)
            if (newFile === true) {
                console.log("🆕 [Mode] Overwrite / Full Refresh");
                
                if (dataEntry === null) {
                    if (instance.hasValidViewName) {
                        data.data = await instance._fetchFullFromDb();
                    } else {
                        data.data = [];
                    }
                } else {
                    // If it's a single object, wrap it in array; if array, use it directly.
                    data.data = Array.isArray(dataEntry) ? dataEntry : [dataEntry];
                }
                
                // Reset metadata for fresh start
                data.db_count_check_counter = instance.hasValidViewName ? 
                    CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER : null;
                data.conditions = instance.conditions;
            } 
            else {
                console.log("🔄 [Mode] Upsert (Modify specific entry)");
                if (dataEntry !== null) {
                    if (!Array.isArray(data.data)) data.data = [];
                    
                    if (keyName && keyValue !== null) {
                        const idx = data.data.findIndex(i => i && String(i[keyName]) === String(keyValue));
                        if (idx >= 0) {
                            data.data[idx] = dataEntry; 
                            console.log(`✅ Updated existing entry: ${keyValue}`);
                        } else {
                            data.data.push(dataEntry); 
                            console.log(`✅ Added new entry: ${keyValue}`);
                        }
                    } else {
                        data.data.push(dataEntry);
                    }
                }
            }

            // 7. FINALIZE (Restored original behavior)
            data.modified_at = nowObj.toISOString();
            data.updated_at = nowObj.toISOString();
            
            if (newFile === true || instance._isExpired(data)) {
                data.expires_at = new Date(nowObj.getTime() + instance.ttlMs).toISOString();
            }

            // Force reset the check counter so we don't hit the DB again immediately
            if (instance.hasValidViewName) {
                data.db_count_check_counter = CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER;
            }

            await instance._saveLazy(data, true);
            
            try { 
                _indexManager.invalidate(instance.tableName);
                this._GROUP_INDEXES.clear();
            } catch (e) {}

            return data;

        } catch (error) {
            console.error("❌ [Critical Failure] save()", error);
            throw error;
        } finally {
            this._FILE_LOCKS.delete(instance._cacheKey);
        }
    }

static async deleteEntry(tableRef, keyName, keyValue, expiryTime = "15d") {
    const instance = this._getInstance(tableRef, expiryTime);
    
    // 1. Load Data (Hydrate from DB if missing so we can delete from a full set)
    let data = await instance._loadFromMemoryOrFile();
    
    if (!data && instance.hasValidViewName) {
        console.log(`📂 [Delete Recovery] File missing for ${instance.tableName}, hydrating before delete...`);
        const freshData = await instance._fetchFullFromDb();
        data = instance._createCacheStructure(freshData);
    }

    if (!data || !Array.isArray(data.data)) {
        console.warn(`⚠️ [Delete] No data found to delete from for ${instance.tableName}`);
        return false;
    }

    const originalLen = data.data.length;
    
    // 2. Normalize Comparison (Fixes the String vs Number issue)
    const targetValue = String(keyValue);
    data.data = data.data.filter(e => {
        if (!e || e[keyName] === undefined) return true;
        return String(e[keyName]) !== targetValue;
    });

    // 3. Save if changed
    if (data.data.length !== originalLen) {
        console.log(`✅ [Delete] Removed key ${keyValue} from ${instance.tableName}. New count: ${data.data.length}`);
        
        const nowObj = new Date();
        data.modified_at = nowObj.toISOString();
        data.updated_at = nowObj.toISOString();
        data.data_length = data.data.length; // Update metadata length

        // Reset check counter so we don't immediately trigger a re-fetch
        if (instance.hasValidViewName) {
            data.db_count_check_counter = CacheConfig.INITIAL_DB_COUNT_CHECK_COUNTER;
        }

        await instance._saveLazy(data, true);
        
        // Clear indexes
        _indexManager.invalidate(instance.tableName);
        this._GROUP_INDEXES.clear();
        
        return true;
    }

    console.log(`ℹ️ [Delete] Key ${keyValue} not found in ${instance.tableName}`);
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
            if (Array.isArray(all) && all.length > 0) {
                _indexManager.buildIndex(instance.tableName, keyName, all);
                result = _indexManager.lookup(instance.tableName, keyName, keyValue);
            }
        }

        if (!result && keyValue !== null && keyValue !== undefined) {
            const stringKey = String(keyValue);
            const numberKey = Number(keyValue);
            if (typeof keyValue === 'number') {
                result = _indexManager.lookup(instance.tableName, keyName, stringKey);
            }
            else if (!isNaN(numberKey)) {
                result = _indexManager.lookup(instance.tableName, keyName, numberKey);
            }
        }

        if (result && filterField !== null) {
            const target = typeof filterValue === 'boolean' ? Number(filterValue) : filterValue;
            if (!this._matchesFilter(result, filterField, target)) return null;
        }

        return result;
    }

    static async getAllByKey(tableRef, keyName, keyValue, expiryTime = "15d") {
        const instance = this._getInstance(tableRef, expiryTime);
        const indexKey = `${instance.tableName}:${keyName}`;

        let groupIndex = this._GROUP_INDEXES.get(indexKey);

        if (!groupIndex) {
            const allData = await this.getAll(tableRef, expiryTime);
            if (!Array.isArray(allData)) return [];

            groupIndex = new Map();
            for (const item of allData) {
                let val = item[keyName];
                if (val === undefined || val === null) continue;
                const stringKey = String(val);
                if (!groupIndex.has(stringKey)) groupIndex.set(stringKey, []);
                groupIndex.get(stringKey).push(item);
            }
            this._GROUP_INDEXES.set(indexKey, groupIndex);
        }

        const searchKey = (keyValue === null || keyValue === undefined) ? '' : String(keyValue);
        return groupIndex.get(searchKey) || [];
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
        } catch (error) {
            console.error('❌ Failed to clear all cache:', error.message);
            return false;
        }
    }

    static async invalidate(tableRef, expiryTime = "15d") {
        const instance = this._getInstance(tableRef, expiryTime);
        _memoryCache.invalidate(instance._cacheKey);
        _indexManager.invalidate(instance.tableName);
        this._GROUP_INDEXES.clear();
        try {
            if (fsSync.existsSync(instance.filePath)) await fs.unlink(instance.filePath);
            const meta = MetadataManager._getMetadataPath(instance.filePath);
            if (fsSync.existsSync(meta)) await fs.unlink(meta);
            console.log(`🗑️ Deleted file: ${instance.tableName}`);
            return true;
        } catch (e) {
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
                            } catch (e) { }
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