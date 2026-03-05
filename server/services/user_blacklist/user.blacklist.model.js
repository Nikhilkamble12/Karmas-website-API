import { DataTypes } from "sequelize";

const UserBlackListModel = (sequelize)=>{
    return sequelize.define("user_blacklist",{
        blacklist_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, blacklisted_user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, reason:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, blacklisted_at:{
            type:DataTypes.DATE,
            allowNull:true
        }, is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : 1
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },{
        tableName: "user_blacklist",
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

export default UserBlackListModel