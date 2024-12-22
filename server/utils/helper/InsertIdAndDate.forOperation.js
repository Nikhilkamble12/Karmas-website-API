import tokenData from "../../utils/helper/get.user.id.by.jwt.js"
import currentTime from "./get.current.time.ist.js";

function addMetaDataWhileCreateUpdate(data, req,res, isUpdate = false) {
    const currentUser = tokenData(req, res);  // Extract user info from token
    const currentTimeStamp = currentTime();   // Get the current timestamp
  
    if (isUpdate) {
      // If it's an update operation
      data.modified_by = currentUser;
      data.modified_at = currentTimeStamp;
    } else {
      // If it's a create operation
      data.created_by = currentUser;
      data.created_at = currentTimeStamp;
      data.is_active=true
    }
    return data;
  }
  export default addMetaDataWhileCreateUpdate