import { DataTypes } from "sequelize";

const NgoMedialikesModel = (sequelize)=>{
    return sequelize.define("ngo_media_likes",{
        like_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, ngo_media_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, is_liked:{
            type:DataTypes.TINYINT(1),
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
        tableName: "ngo_media_likes",
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

export default NgoMedialikesModel