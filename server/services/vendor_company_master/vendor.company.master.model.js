import { DataTypes } from "sequelize";

const VendorCompanyMasterModel = (sequelize)=>{
    return sequelize.define("vendor_company_master",{
        company_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, company_name:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, company_photo_name:{
            type:DataTypes.STRING(250),
            allowNull:true
        }, company_photo_path:{
            type:DataTypes.STRING(250),
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
        tableName: "vendor_company_master",
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

export default VendorCompanyMasterModel