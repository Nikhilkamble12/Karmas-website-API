import { DataTypes } from "sequelize";

const UserActivityModel = (sequelize)=>{
    return sequelize.define("user_activity",{
        user_activity_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, follower_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, following_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_reports_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_scores_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_requests_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_rewards_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_likes_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_comments_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        },total_request_like_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        total_request_comment_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        total_shares_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_blacklist_user:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, total_refer_and_earn_no:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, show_user_chats_history:{
            type:DataTypes.TINYINT(1),
            allowNull:true
        }, show_user_posts_history:{
            type:DataTypes.TINYINT(1),
            allowNull:true
        }, screen_time:{
            type:DataTypes.INTEGER,
            allowNull:true
        }, last_active_at:{
            type:DataTypes.DATE,
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
        tableName: "user_activity",
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

export default UserActivityModel