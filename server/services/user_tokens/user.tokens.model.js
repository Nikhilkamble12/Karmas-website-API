import  {DataTypes} from "sequelize"

const UserTokenModel = (sequelize)=>{
    return sequelize.define("user_tokens",{
        user_token_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        },role_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        },android_token:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, web_token:{
            type:DataTypes.STRING(255),
            allowNull:true
        }, is_android:{
            type:DataTypes.BOOLEAN,
            allowNull:true
        }, is_web:{
            type:DataTypes.BOOLEAN,
            allowNull:true
        }, is_android_on:{
            type:DataTypes.BOOLEAN,
            allowNull:true
        }, is_web_on:{
            type:DataTypes.BOOLEAN,
            allowNull:true
        },is_active: {
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
        },updated_at:{
            type:DataTypes.DATE,
            allowNull:true
        }
    },{
        tableName: "user_tokens",
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

export default UserTokenModel