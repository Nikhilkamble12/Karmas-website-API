import { DataTypes } from "sequelize";

const NgoMediaModel = (sequelize)=>{
    return sequelize.define("ngo_media",{
        ngo_media_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, sequence:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, ngo_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, media_type:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, media_url:{
            type:DataTypes.STRING(255),
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
        tableName: "ngo_media",
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

export default NgoMediaModel