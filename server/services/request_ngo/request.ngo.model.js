import { DataTypes } from "sequelize";

const RequestNgoModel = (sequelize)=>{
    return sequelize.define("request_ngo",{
        Request_Ngo_Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull:true,
            autoIncrement: true
        }, RequestId:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, ngo_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, status_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, Reason:{
            type:DataTypes.TEXT,
            allowNull:true
        }, AssignedDate:{
            type:DataTypes.DATE,
            allowNull:true
        }, ApprovalDate:{
            type:DataTypes.DATE,
            allowNull:true
        }, is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        modified_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },{
        tableName: "request_ngo",
        paranoid: true,
        timestamps: false,
        defaultScope: {
            attributes: {
                exclude: [
                    "created_by",
                    "modified_by",
                    "deleted_by",
                    "deleted_at",
                    "is_active",
                    "created_at",
                    "modified_at",
                ],
            },
        },
    })
}
export default RequestNgoModel