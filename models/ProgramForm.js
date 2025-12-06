module.exports = (sequelize, DataTypes) => {
  const ProgramForm = sequelize.define(
    'ProgramForm',
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
      tableName: 'program_forms',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  ProgramForm.associate = (models) => {
    ProgramForm.hasMany(models.ProgramFormEntry, {
      foreignKey: 'program_form_id',
      as: 'entries',
    });
  };

  return ProgramForm;
}; 