import jwt from "jsonwebtoken";
import { secret } from "../../config/auth/auth.config.js";
import commonResponse from "./response.js";
import responseConst from "../constants/response/response.constant.js";
import responseCode from "../constants/code/http.status.code.js";

const authenticate = (req, res, next) => {
  try {
    if (
      req.headers["x-access-token"] == null ||
      req.headers["x-access-token"] == undefined
    ) {
      return null;
    } else {

      var token = req.headers["x-access-token"];
      const decoded = jwt.verify(token, secret);
      return decoded.user_id;
    }
  } catch (err) {
    console.log("err",err)
    if (err.name == "TokenExpiredError") {
      return res
        .status(responseCode.UNAUTHORIZED)
        .send(
          commonResponse(responseCode.UNAUTHORIZED, responseConst.JWT_EXPIRED)
        );
    } else {
      return res
        .status(responseCode.UNAUTHORIZED)
        .send(
          commonResponse(
            responseCode.UNAUTHORIZED,
            responseConst.UNVERIFIED_TOKEN
          )
        );
    }
  }
};

export default authenticate;
