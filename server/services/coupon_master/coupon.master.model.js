import { DataTypes } from "sequelize";

const CouponMasterModel = (sequelize)=>{
    return sequelize.define("coupon_master",{
        coupon_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, coupon_code:{
            type:DataTypes.STRING(100),
            allowNull:false
        }, rate:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        }, company_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, amount:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        }, active_date:{
            type:DataTypes.DATE,
            allowNull:false
        }, expires_date:{
            type:DataTypes.DATE,
            allowNull:false
        }, distribution:{
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
        tableName: "coupon_master",
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
export default CouponMasterModel