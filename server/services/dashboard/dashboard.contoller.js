import commonPath from "../../middleware/comman_path/comman.path.js";
import RequestService from "../requests/requests.service.js";
import NgoMasterService from "../ngo_master/ngo.master.service.js";
const {commonResponse,responseCode,responseConst,logger,tokenData,currentTime,addMetaDataWhileCreateUpdate} = commonPath

const DashBoardController = {
webDashBoardData:async(req,res)=>{
    try{
        const NgoCount = await  NgoMasterService.getTotalSumOfData()
        const RequestCount = await RequestService.getCountOfTotalRequest()
        const mergedData = {
            ...NgoCount[0],
            ...RequestCount[0]
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
}
} 
export default DashBoardController