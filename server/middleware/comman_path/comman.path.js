import dotenv from 'dotenv';
dotenv.config();
import responseConst from "../../utils/constants/response/response.constant.js";
import commonResponse from "../../utils/helper/response.js";
import responseCode from "../../utils/constants/code/http.status.code.js";
import logger from "../../config/winston_logs/winston.js";
import tokenData from "../../utils/helper/get.user.id.by.jwt.js";
import currentTime from "../../utils/helper/get.current.time.ist.js";
import encrypt from "../../utils/security/encryption.js";
import decrypt from "../../utils/security/decryption.js";
// import CommanJsonFunction from "../../utils/helper/comman.json.js";
// import JSON_CONSTANTS from "../../utils/constants/json_constants/json.constants.js";
// import apiExistenceMiddleware from "../route_validation/route.validation.js";
import db from "../../services/index.js";
import STORE_PROCEDURES from "../../utils/db/store.procedure.constants.js";
import ViewFieldTableVise from "../../utils/db/view.fields.contants.js";
import argon2 from 'argon2';
import addMetaDataWhileCreateUpdate from "../../utils/helper/InsertIdAndDate.forOperation.js";
import express from "express"
import verifyToken from "../auth/authJwt.js";
import JWT from "jsonwebtoken";
import { Op } from 'sequelize';
const basePathRoute =`${process.env.BASE_ROUTE_PATH || '/api/v1'}`

const commonPath={
    responseConst:responseConst,
    commonResponse:commonResponse,
    responseCode:responseCode,
    logger:logger,
    tokenData:tokenData,
    currentTime:currentTime,
    encrypt:encrypt,
    decrypt:decrypt,
    // JSON_CONSTANTS:JSON_CONSTANTS,
    // apiExistenceMiddleware:apiExistenceMiddleware,
    addMetaDataWhileCreateUpdate:addMetaDataWhileCreateUpdate,
    db:db,
    STORE_PROCEDURES:STORE_PROCEDURES,
    ViewFieldTableVise:ViewFieldTableVise,
    express:express,
    verifyToken:verifyToken,
    basePathRoute:basePathRoute,
    // CommanJsonFunction:CommanJsonFunction,
    JWT,
    Op
}

export default commonPath