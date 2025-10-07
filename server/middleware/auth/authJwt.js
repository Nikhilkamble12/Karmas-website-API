//----- Validate JWT Token

import jwt from "jsonwebtoken";
import { secret } from "../../config/auth/auth.config.js";
import responseCode from "../../utils/constants/code/http.status.code.js";
import responseConst from "../../utils/constants/response/response.constant.js";
import commonResponse from "../../utils/helper/response.js";

const authenticate = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(responseCode.UNAUTHORIZED)
      .send(
        commonResponse(
          responseCode.INTERNAL_SERVER_ERROR,
          responseConst.NO_TOKEN,
          null,
          true
        )
      );
  }

  jwt.verify(token, secret, (err, decoded) => {
    console.log("err",err)
    if (err) {
      return res
        .status(responseCode.UNAUTHORIZED)
        .send(
          commonResponse(
            responseCode.BAD_REQUEST,
            responseConst.UNAUTHORIZED,
            null,
            true
          )
        );
    }
    req.userId = decoded.id;
    next();
  });
};

export default authenticate;
