import JsonAutoUpdateCommonController from "./json.auto.update.common.controller.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const {express,basePathRoute} = commonPath

const basePath=`${basePathRoute}/json_auto_update_common`
const router = express.Router();

router.post(`${basePath}/sync/push`, JsonAutoUpdateCommonController.AutomaticUpdateJsonData);

export default router;