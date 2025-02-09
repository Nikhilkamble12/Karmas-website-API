import { DataTypes } from "sequelize";

const NgoMasterModel = (sequelize)=>{
    return sequelize.define("ngo_master",{
        ngo_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },ngo_name:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        unique_id:{
            type:DataTypes.STRING(50),
            allowNull:true
        }, darpan_reg_date:{
            type:DataTypes.DATE,
            allowNull:true
        }, ngo_type:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, registration_no:{
            type:DataTypes.STRING(50),
            allowNull:false
        }, act_name:{
            type:DataTypes.STRING(250),
            allowNull:true
        }, city_of_registration_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, state_of_registration_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, country_of_registration_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, date_of_registration:{
            type:DataTypes.DATE,
            allowNull:true
        }, address:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, city_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, state_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, country_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, telephone:{
            type:DataTypes.STRING(15),
            allowNull:true
        }, mobile_no:{
            type:DataTypes.STRING(15),
            allowNull:true
        }, website_url:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, email:{
            type:DataTypes.STRING(100),
            allowNull:false
        }, ngo_logo:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, ngo_logo_path:{
            type:DataTypes.STRING(500),
            allowNull:true
        }, pan_cad_file_name:{
            type:DataTypes.STRING(150),
            allowNull:true
        }, pan_card_file_url:{
            type:DataTypes.STRING(350),
            allowNull:true
        }, crs_regis_file_name:{
            type:DataTypes.STRING(155),
            allowNull:true
        }, crs_regis_file_path:{
            type:DataTypes.STRING(350),
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
        tableName: "ngo_master",
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

export default NgoMasterModel