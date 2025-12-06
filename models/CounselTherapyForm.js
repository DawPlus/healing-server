const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CounselTherapyForm extends Model {
    static associate(models) {
      CounselTherapyForm.hasMany(models.CounselTherapyFormEntry, {
        foreignKey: "counsel_therapy_form_id",
        as: "entries",
        onDelete: "CASCADE",
      });
    }
  }

  CounselTherapyForm.init(
    {
      agency: DataTypes.STRING,
      openday: DataTypes.STRING,
      eval_date: DataTypes.STRING,
      ptcprogram: DataTypes.STRING,
      counsel_contents: DataTypes.TEXT,
      session1: DataTypes.STRING,
      session2: DataTypes.STRING,
      pv: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CounselTherapyForm",
      tableName: "counsel_therapy_forms",
      underscored: true,
    }
  );

  return CounselTherapyForm;
}; 