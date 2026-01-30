import { DataTypes } from "sequelize";

const RequestDocumentModel = (sequelize)=>{
    return sequelize.define("request_documents",{
        request_document_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, RequestId:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, document_type_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, document_type_name:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, file_name:{
            type:DataTypes.STRING(350),
            allowNull:true
        }, s3_url:{
            type:DataTypes.STRING(800),
            allowNull:true
        }, media_url:{
            type:DataTypes.STRING(800),
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
        tableName: "request_documents",
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

export default RequestDocumentModel