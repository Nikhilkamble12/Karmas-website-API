import { DataTypes } from "sequelize";

const MenuModel = (sequelize)=>{
    return sequelize.define("menu",{
        menu_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, menu:{
            type:DataTypes.TEXT,
            allowNull:true
        }, role_type:{
            type:DataTypes.STRING(50),
            allowNull:true
        }, ip_address:{
            type:DataTypes.STRING(100),
            allowNull:true
        }, city_cordinates:{
            type:DataTypes.STRING(150),
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
        tableName: "menu",
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

export default MenuModel