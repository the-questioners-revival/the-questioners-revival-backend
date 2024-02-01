export const migrations = [
  {
    key: '1612345678901-CreateUserTable',
    script: `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    key: '20240130120000-CreateTodoTable',
    script: `
      CREATE TABLE todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240131120000-AddPasswordToUsersTable',
    script: `
      ALTER TABLE users
      ADD COLUMN password VARCHAR(255);
    `,
  },
  {
    key: '20240131121500-AddUniqueConstraintsUsernameAndEmailToUsersTable',
    script: `
      ALTER TABLE users
      ADD CONSTRAINT unique_username UNIQUE (username),
      ADD CONSTRAINT unique_email UNIQUE (email);
    `,
  },
  {
    key: '20240130150000-CreateQaaTable',
    script: `
      CREATE TABLE qaas (
        id SERIAL PRIMARY KEY,
        question VARCHAR(255) NOT NULL,
        answer VARCHAR(2047) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240131123456-CreateBlogTable',
    script: `
      CREATE TABLE blogs (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240131120000-AddUpdatedAt',
    script: `
      ALTER TABLE todos
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE qaas
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE blogs
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE users
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `,
  },
  {
    key: '20240130120000-AddLinkToQaas',
    script: `
      ALTER TABLE qaas
      ADD COLUMN link VARCHAR(511);
    `,
  },
];
