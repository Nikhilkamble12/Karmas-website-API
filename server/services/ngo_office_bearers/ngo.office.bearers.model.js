import { DataTypes } from "sequelize";

const NgoOfficeBearersModel = (sequelize)=>{
    return sequelize.define("ngo_office_bearers",{
        bearer_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, ngo_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, name:{
            type:DataTypes.STRING(150),
            allowNull:false
        }, designation_id:{
            type:DataTypes.INTEGER,
            allowNull:false
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
        tableName: "ngo_office_bearers",
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
export default NgoOfficeBearersModel