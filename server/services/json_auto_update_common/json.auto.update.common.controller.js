// controllers/JsonAutoUpdateCommonController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Works cross-platform (Windows, Linux, macOS)
const BASE_DIR = path.resolve(__dirname, '../resources/json');


const JsonAutoUpdateCommonController = {
    AutomaticUpdateJsonData :async(req, res)=>{
        const { path: relativePath, operation, data, field } = req.body;
        const filePath = path.join(BASE_DIR, relativePath);
        try {
            if (operation === 'DELETE_FILE') {
            await fs.promises.unlink(filePath);
            return res.sendStatus(200);
            }

            let fileData = { value: [] };

            if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(raw);
            fileData.value = Array.isArray(parsed.value) ? parsed.value : [];
            }

            if (operation === 'FULL_REPLACE') {
            fileData.value = Array.isArray(data) ? data : [];
            }

            if (operation === 'ADD_OR_UPDATE' && data && field) {
            const index = fileData.value.findIndex(item => item[field] === data[field]);
            if (index !== -1) {
                // Replace only if newer
                if (!fileData.value[index].timestamp || data.timestamp > fileData.value[index].timestamp) {
                fileData.value[index] = data;
                }
            } else {
                fileData.value.push(data);
            }
            }

            if (operation === 'DELETE' && data && field) {
            fileData.value = fileData.value.filter(item => item[field] !== data[field]);
            }

            if (operation !== 'DELETE_FILE') {
            await fs.promises.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');
            }

            res.sendStatus(200);
        } catch (err) {
            console.error('⚠️ Error handling push sync:', err);
            res.sendStatus(500);
        }
    }
}
export default JsonAutoUpdateCommonController