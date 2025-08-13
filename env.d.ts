declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    DRIZZLE_DATABASE_URL?: string;
    ADMIN_API_SECRET?: string;
  }
}
