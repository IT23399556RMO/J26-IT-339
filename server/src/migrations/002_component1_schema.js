/**
 * Creates the `user_preferences` table for biometeorological preferences.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("user_preferences", {
    user_id: {
      type: "uuid",
      primaryKey: true,
      references: "users",
      onDelete: "CASCADE",
    },
    thermal_tolerance: {
      type: "integer",
      notNull: true,
      default: 50,
    },
    rain_tolerance: {
      type: "integer",
      notNull: true,
      default: 50,
    },
    uv_sensitivity: {
      type: "integer",
      notNull: true,
      default: 50,
    },
    wind_preference: {
      type: "integer",
      notNull: true,
      default: 50,
    },
    exertion_capacity: {
      type: "varchar(50)",
      notNull: true,
      default: "Moderate",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable("user_preferences");
};

