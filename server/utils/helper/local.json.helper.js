import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_DIR = path.join(__dirname, '../../resources/json');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
}

function getFilePath(relativePath) {
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(BASE_DIR, safePath);
}

function load(filePath) {
  ensureDir(filePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');
}

function save(filePath, data) {
  fs.writeFileSync(filePath, data);
}

function isExpired(entry) {
  return entry.expiresAt && Date.now() > entry.expiresAt;
}

function getRemainingMs(entry) {
  return entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now()) : null;
}


async function set(relativePath, key, newValue, ttlMs = null) {
  const filePath = path.join(BASE_DIR, relativePath);
  const now = Date.now();
  const expiresAt = ttlMs ? now + ttlMs : null;
  // Initialize default file structure
  let fileData = {
    value: [],
    createdAt: now,
    updatedAt: now,
    expiresAt,
    ttlMs
  };

  // If file exists, read it
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
    //   console.log("🔍 Raw file content:", raw);
      const parsed = JSON.parse(raw);
      fileData = {
        value:Array.isArray(parsed.value) ? parsed.value : [],
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
  // Work with the array inside `value`
  let updated = false;
  if (key) {
    // Try to find and update entry by key (e.g., user_id or id)
    fileData.value = fileData.value.map(item => {
      if (item[key] !== undefined && item[key] === newValue[key]) {
        updated = true;
        return { ...item, ...newValue };
      }
      return item;
    });
  }else{
    fileData.value = newValue
  }

  // If not updated (no key match), push as new
  if (!updated) {
    fileData.value= newValue;
  }

  // Save file
   // Use async write
   await fs.promises.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
  return true;
}




function getById(relativePath, field, value) {
    const filePath = getFilePath(relativePath);
    const db = load(filePath);
  
    // Ensure the value is an array and search for the entry by the given field and value
    const entry = db.value && Array.isArray(db.value)
      ? db.value.find(item => item[field] === value)
      : null;
  
    if (!entry || isExpired(entry)) {
      return null;
    }
  
    return {
      value: entry,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
      expiresAt: db.expiresAt,
      ttlMs: db.ttlMs,
      remainingMs: getRemainingMs(entry)
    };
  }
  

  async function getAll(relativePath) {
    const filePath = path.join(BASE_DIR, relativePath);
    
    if (!fs.existsSync(filePath)) {
      return [];  // Return an empty array if the file doesn't exist
    }
  
    try {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      console.log("------>raw",raw)
      const parsed = JSON.parse(raw);
    console.log("parsed",parsed)
      // Ensure `value` is an array and return it
        // Check if `parsed.value` is an object and return its properties
    if (parsed.value && typeof parsed.value === 'object') {
        return parsed.value;  // Return the object if it's structured as expected
      }
      return []
    } catch (err) {
      console.warn('⚠️ Error reading or parsing file:', err);
      return [];  // Return an empty array if error occurs
    }
  }

function remove(relativePath, key) {
  const filePath = getFilePath(relativePath);
  const db = load(filePath);

  if (db[key]) {
    delete db[key];
    save(filePath, db);
    return true;
  }

  return false;
}

const LocalJsonHelper = {
  set,
  getById,
  getAll,
  remove
};

export default LocalJsonHelper;
