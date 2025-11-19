import commonPath from "../../middleware/comman_path/comman.path.js";
import RequestService from "../requests/requests.service.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
import UserMasterService from "../user_master/user.master.service.js";
import ScoreHistoryService from "../score_history/score.history.service.js";
import RequestNgoService from "../request_ngo/request.ngo.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const DashBoardController = {
webDashBoardData:async(req,res)=>{
    try{
        ngo_id = req.query.ngo_id
        let userCount
        let RequestCount
        let recentRequestAll
        const NgoCount = await  NgoMasterService.getTotalSumOfData(ngo_id)
        if(ngo_id){
        RequestCount = await RequestService.getCountOfTotalRequestByNgoId(ngo_id)
        userCount = await UserMasterService.getUserMasterCountByNgoId(ngo_id)
        recentRequestAll = await RequestService.getRecentHundredRequestDesc(ngo_id)
        }else{
        RequestCount = await RequestService.getCountOfTotalRequest()
        userCount = await UserMasterService.getUserMasterDashBoardCount()
        recentRequestAll = await RequestService.getRecentHundredRequestDesc()
        }
        const ScoreCount = await ScoreHistoryService.ScoreDashBoardCount()
        const mergedData = {
            ...NgoCount[0],
            ...RequestCount[0],
            ...userCount[0],
            ...ScoreCount[0],
            recentRequestAll:recentRequestAll
        }
        if (mergedData.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            mergedData
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
    }catch(error){
        logger.error(`Error ---> ${error}`);
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .send(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
    }
},getNgoCount:async(req,res)=>{
    try{
        const ngo_id = req.query.ngo_id
        const NgoCount = await  NgoMasterService.getTotalSumOfData(ngo_id)
        if (NgoCount.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            NgoCount[0]
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
    }catch(error){
    logger.error(`Error ---> ${error}`);
    return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
        );
    }
},getRequestCount:async(req,res)=>{
    try{
        const ngo_id = req.query.ngo_id
        let RequestCount = []
        if(ngo_id && ngo_id!=="" && ngo_id!=="null"){
            RequestCount = await RequestNgoService.getRequestNgoCountByNgo(ngo_id)
        }else{
            RequestCount = await RequestService.getCountOfTotalRequest()
        }
        if (RequestCount.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            RequestCount[0]
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }

    }catch(error){
        logger.error(`Error ---> ${error}`);
    return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
        );
    }
},getUserCount:async(req,res)=>{
    try{
        const ngo_id = req.query.ngo_id
        let user_count = []
        if(ngo_id && ngo_id!=="" && ngo_id!=="null" && ngo_id!=="undefined"){
        user_count =await UserMasterService.getUserMasterCountByNgoId(ngo_id)
        }else{
        user_count = await UserMasterService.getUserMasterDashBoardCount()
        }
        if (RequestCount.length !== 0) {
                return res
                    .status(responseCode.OK)
                    .send(
                        commonResponse(
                            responseCode.OK,
                            responseConst.DATA_RETRIEVE_SUCCESS,
                            RequestCount[0]
                        )
                    );
            } else {
                return res
                    .status(responseCode.BAD_REQUEST)
                    .send(
                        commonResponse(
                            responseCode.BAD_REQUEST,
                            responseConst.DATA_NOT_FOUND,
                            null,
                            true
                        )
                    );
            }
    }catch(error){
        logger.error(`Error ---> ${error}`);
    return res
        .status(responseCode.INTERNAL_SERVER_ERROR)
        .send(
            commonResponse(
                responseCode.INTERNAL_SERVER_ERROR,
                responseConst.INTERNAL_SERVER_ERROR,
                null,
                true
            )
        );
    }
}
} 
export default DashBoardController