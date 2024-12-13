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
  {
    key: '20240204172637-CreateHabitsTable',
    script: `
      CREATE TABLE habits (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240204174356-CreateHabitsTrackersTable',
    script: `
      CREATE TABLE habits_trackers (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    key: '20240206222709-AddRepeatToHabits',
    script: `
      ALTER TABLE habits
      ADD COLUMN repeat VARCHAR(255);
    `,
  },
  {
    key: '20240204183015-CreateGoalsTable',
    script: `
      CREATE TABLE goals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240206222709-AddCompletedAtToGoals',
    script: `
      ALTER TABLE goals
      ADD COLUMN completed_at TIMESTAMP;
    `,
  },
  {
    key: '20240206230715-CreateReviewsTable',
    script: `
      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `,
  },
  {
    key: '20240206223456-AddPriorityToTodos',
    script: `
      ALTER TABLE todos
      ADD COLUMN priority VARCHAR(50);
    `,
  },
  {
    key: '20240206223500-AddUserIdToTodos',
    script: `
      ALTER TABLE todos
      ADD COLUMN user_id INTEGER REFERENCES users(id);
    `,
  },
  {
    key: '20240206223631-AddUserIdToQaasBlogsHabitsGoalsReviews',
    script: `
      ALTER TABLE qaas
      ADD COLUMN user_id INTEGER REFERENCES users(id);
      ALTER TABLE blogs
      ADD COLUMN user_id INTEGER REFERENCES users(id);
      ALTER TABLE habits
      ADD COLUMN user_id INTEGER REFERENCES users(id);
      ALTER TABLE goals
      ADD COLUMN user_id INTEGER REFERENCES users(id);
      ALTER TABLE reviews
      ADD COLUMN user_id INTEGER REFERENCES users(id);
    `,
  },
  {
    key: '20240206223740-AddUserIdToHabitsTrackers',
    script: `
      ALTER TABLE habits_trackers
      ADD COLUMN user_id INTEGER REFERENCES users(id);
    `,
  },
  {
    key: '20240216235600-ChangeTodoTitleToLongerText',
    script: `
      ALTER TABLE todos 
      ALTER COLUMN title TYPE VARCHAR(1023);
    `,
  },
  {
    key: '20240216235824-ChangeQaasAnswerToText',
    script: `
      ALTER TABLE qaas 
      ALTER COLUMN answer TYPE TEXT,
      ALTER COLUMN answer SET NOT NULL;
    `,
  },
  {
    key: '20241008175425-AddForeignKeyForTodoInBlog',
    script: `
      ALTER TABLE blogs
      ADD COLUMN todo_id INTEGER;
      ALTER TABLE blogs
      ADD CONSTRAINT fk_todo
      FOREIGN KEY (todo_id)
      REFERENCES todos(id);
    `,
  },
  {
    key: '20241010123400-CreateTodoScheduleTable',
    script: `
    CREATE TABLE todo_schedules (
      id SERIAL PRIMARY KEY,
      todo_id INTEGER NOT NULL,
      scheduled_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      FOREIGN KEY (todo_id) REFERENCES todos(id)
    );
  `,
  },
  {
    key: '20241209120000-CreateCategoriesTable',
    script: `
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `,
  },
  {
    key: '20241209120000-AddCategoryIdToTodosQaasBlogs',
    script: `
      -- Add category_id to todos table
      ALTER TABLE todos 
      ADD COLUMN category_id INTEGER;
  
      -- Add foreign key constraint to todos
      ALTER TABLE todos 
      ADD CONSTRAINT fk_category_todos
      FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE SET NULL;
  
      -- Add category_id to qaas table
      ALTER TABLE qaas 
      ADD COLUMN category_id INTEGER;
  
      -- Add foreign key constraint to qaas
      ALTER TABLE qaas 
      ADD CONSTRAINT fk_category_qaas
      FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE SET NULL;
  
      -- Add category_id to blogs table
      ALTER TABLE blogs 
      ADD COLUMN category_id INTEGER;
  
      -- Add foreign key constraint to blogs
      ALTER TABLE blogs 
      ADD CONSTRAINT fk_category_blogs
      FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE SET NULL;
    `,
  },
  {
    key: '20241213180000-CreateImagesTable',
    script: `
      CREATE TABLE images (
        id SERIAL PRIMARY KEY,
        file_path VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];
