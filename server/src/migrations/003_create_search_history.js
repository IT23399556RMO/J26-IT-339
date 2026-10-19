/**
 * Creates the `search_history` table for tracking destination evaluations and watchlist.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("search_history", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    destination_name: {
      type: "varchar(255)",
      notNull: true,
    },
    activity_category: {
      type: "varchar(100)",
      notNull: true,
      default: "General Sightseeing",
    },
    target_date: {
      type: "varchar(50)",
      notNull: true,
    },
    suitability_score: {
      type: "integer",
      notNull: true,
    },
    is_saved: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("search_history", ["user_id", "is_saved", "created_at"]);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable("search_history");
};

