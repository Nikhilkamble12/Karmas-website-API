import { DataTypes } from "sequelize";

const CouponsModel = (sequelize) => {
  return sequelize.define(
    "coupons",
    {
      coupon_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gift_master_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      coupon_code: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      redeem_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      redeem_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
    },
    {
      tableName: "coupons",
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
    }
  );
};

export default CouponsModel;
