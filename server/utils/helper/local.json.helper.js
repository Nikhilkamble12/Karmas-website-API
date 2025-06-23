import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const fsPromises = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import commonPath from '../../middleware/comman_path/comman.path.js';

const { basePathRoute } = commonPath;

const BASE_DIR = path.join(__dirname, '../../resources/json');

// List of peer backend instances (adjust ports/hosts as needed)
const PEERS = [
   
];
 
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
}

function getFilePath(relativePath) {
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(BASE_DIR, safePath);
}

async function load(filePath) {
  await ensureDir(filePath);
  const data = await fsPromises.readFile(filePath, 'utf-8');
  return JSON.parse(data || '{}');
}

async function save(filePath, data) {
  await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function isExpired(entry) {
  return entry.expiresAt && Date.now() > entry.expiresAt;
}

function getRemainingMs(entry) {
  return entry.expiresAt ? Math.max(0, entry.expiresAt - Date.now()) : null;
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'
  }
  function formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00:00';
  
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }
    
function deleteFile(filePath) {
    try {
      fs.unlinkSync(filePath);  // Delete the expired file
      console.log(`File ${filePath} deleted due to expiration.`);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
  
  export async function broadcastToPeers(relativePath, operation, data = null, field = null) {
  for (const peer of PEERS) {
    const fullUrl = `${peer}${basePathRoute}/json_auto_update_common/sync/push`;
    try {
      await axios.post(fullUrl, {
        path: relativePath,
        operation,
        data,
        field
      });
    } catch (err) {
      console.warn(`⚠️ Push to peer ${peer} failed:`, err.message);
    }
  }
}



async function set(relativePath, key, newValue, ttlMs = null) {
  try{
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
  let operationType = ""
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
      if (item[key] !== undefined && item[key] == newValue[key]) {
        updated = true;
        return newValue;  // Replace instead of merging
      }
      return item;
    });
    if (!updated) {
      fileData.value.push(newValue); 
    }
    operationType = 'ADD_OR_UPDATE';
  }else{
    operationType = 'FULL_REPLACE';
    fileData.value = newValue
  }

  // If not updated (no key match), push as new
  
// // Split the relative path to get the directory
// const dir = path.join(BASE_DIR, relativePath.substring(0, relativePath.lastIndexOf('/')));
// await fs.promises.mkdir(dir, { recursive: true });

 // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    
  // Save file
   // Use async write
   await fs.promises.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
   if(operationType!==""){
   await broadcastToPeers(relativePath, operationType, newValue, key);
   }

  return true;
}catch(error){
  console.log(" inside json set error -->",error)
}
}




async function getById(relativePath, field, value) {
    const filePath = getFilePath(relativePath);
    const db = await load(filePath);
    // Check for file expiration
    if (isExpired(db)) {
        deleteFile(filePath);  // Delete expired file
        return [];
      }
    // Ensure the value is an array and search for the entry by the given field and value
    const entry = db.value && Array.isArray(db.value)
      ? db.value.find(item => item[field] == value)
      : [];
  
    if (!entry || isExpired(entry)) {
      return [];
    }
    
    return {
      value: entry,
      createdAt: formatDate(db.createdAt),
      updatedAt: formatDate(db.updatedAt),
      expiresAt: formatDate(db.expiresAt),
      ttlMs: formatTimeRemaining(db.ttlMs),
      remainingMs: formatTimeRemaining(getRemainingMs(entry))
    };
  }

async function getAllByField(relativePath, field, value) {
  const filePath = getFilePath(relativePath);
  const db = await load(filePath);

  // Check for file expiration
  if (isExpired(db)) {
    deleteFile(filePath);  // Delete expired file
    return [];
  }

  // Filter all matching entries
  // Filter all matching entries
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
    expiresAt: formatDate(db.expiresAt),
    ttlMs: formatTimeRemaining(db.ttlMs),
    remainingMs: formatTimeRemaining(getRemainingMs(db))
  };

}

  

  async function getAll(relativePath) {
    const filePath = path.join(BASE_DIR, relativePath);
    
    if (!fs.existsSync(filePath)) {
      return [];  // Return an empty array if the file doesn't exist
    }
   
    try {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      // Check for file expiration
      if (isExpired(parsed)) {
        deleteFile(filePath);  // Delete expired file
        return [];  // Return empty array if expired
      }
      // Ensure `value` is an array and return it
        // Check if `parsed.value` is an object and return its properties

    const remainingMs = parsed.expiresAt ? parsed.expiresAt - Date.now() : null;
    if (parsed.value && typeof parsed.value === 'object') {
        return {
            ...parsed.value,
            createdAt: formatDate(parsed.createdAt),
            updatedAt: formatDate(parsed.updatedAt),
            expiresAt: formatDate(parsed.expiresAt),
            ttlMs: formatTimeRemaining(parsed.ttlMs),
            remainingMs:formatTimeRemaining(remainingMs)
        };  // Return the object if it's structured as expected
      }
      return []
    } catch (err) {
      console.warn('⚠️ Error reading or parsing file:', err);
      return [];  // Return an empty array if error occurs
    }
  }

async function remove(relativePath, key, value) {
  const filePath = getFilePath(relativePath);
  const db = await load(filePath);

  if (Array.isArray(db.value)) {
    const originalLength = db.value.length;

    // Filter out the object with the matching key-value pair
    db.value = db.value.filter(item => item[key] !== value);

    // If at least one object was removed, update updatedAt and save
    if (db.value.length < originalLength) {
      db.updatedAt = Date.now();
      await save(filePath, db);
      return true;
    }
  }
  await broadcastToPeers(relativePath, 'DELETE', { [key]: value }, key);


  // Nothing was removed
  return false;
}

async function checkDataStatus(relativePath) {
  const filePath = getFilePath(relativePath);
  try {
    await fsPromises.access(filePath);
    const raw = await fsPromises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (isExpired(parsed)) {
      deleteFile(filePath);
      return { exists: false, expired: true, totalCount: 0 };
    }

    const totalCount = Array.isArray(parsed.value) ? parsed.value.length : 0;
    return { exists: true, expired: false, totalCount };

  } catch (err) {
    console.log("json err-->",err)
    if (err.code === 'ENOENT') {
      console.log("inside if")
      return { exists: false, expired: false, totalCount: 0 };
    } else {
      console.log("inside else")
      console.error('Error reading file:', filePath, err);
      throw err;
    }
  }
}
async function deleteFullFile(relativePath) {
  const filePath = getFilePath(relativePath);

  try {
    await fsPromises.unlink(filePath);  // deletes the file
    console.log(`File ${filePath} deleted.`);
    await broadcastToPeers(relativePath, 'DELETE_FILE');
    return true;
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

const LocalJsonHelper = {
  set,
  getById,
  getAll,
  getAllByField,
  remove,
  checkDataStatus,
  deleteFullFile
};

export default LocalJsonHelper;
