module.exports = (sequelize, DataTypes) => {
  const ServiceForm = sequelize.define(
    'ServiceForm',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      openday: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eval_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ptcprogram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'service_forms',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  ServiceForm.associate = (models) => {
    ServiceForm.hasMany(models.ServiceFormEntry, {
      foreignKey: 'service_form_id',
      as: 'entries',
    });
  };

  return ServiceForm;
}; 