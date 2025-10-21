import { request } from "express";
import RequestLikeDAL from "./request.likes.data.layer.js";

const RequestLikeService = {
    // Method to create a new record
    createService: async (data) => {
        try {
            return await RequestLikeDAL.CreateData(data)
        } catch (error) {
            throw error
        }
    },
    // Method to update an existing record by its ID 
    updateService: async (like_id, data) => {
        try {
            return await RequestLikeDAL.UpdateData(like_id, data)
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve all records
    getAllService: async () => {
        try {
            return await RequestLikeDAL.getAllDataByView()
        } catch (error) {
            throw error
        }
    },
    // Method to retrieve a specific record by its ID 
    getServiceById: async (like_id) => {
        try {
            return await RequestLikeDAL.getDataByIdByView(like_id)
        } catch (error) {
            throw error
        }
    }, 
    // Method to mark a record as deleted (soft delete) by its ID
    deleteByid: async (like_id, req, res) => {
        try {
            return await RequestLikeDAL.deleteDataById(like_id, req, res)
        } catch (error) {
            throw error
        }
    },getRequestLikeByRequestId:async(request_id,limit,offset)=>{
        try{
            return await RequestLikeDAL.getRequestLikeByRequestIdByView(request_id,limit,offset)
        }catch(error){
            throw error
        }
    },getRequestLikeByUserId:async(user_id,limit,offset)=>{
        try{
            return await RequestLikeDAL.getRequestLikeByUserIdByView(user_id,limit,offset)
        }catch(error){
            throw error
        }
    },getDataByUserIdandRequestId:async(user_id,request_id)=>{
        try {
            return await RequestLikeDAL.getDataByUserIdandRequestId(user_id,request_id)
        } catch (error) {
            throw error
        }
    }
}
export default RequestLikeService