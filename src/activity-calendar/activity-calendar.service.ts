import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { format } from 'date-fns';

@Injectable()
export class ActivityCalendarService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getDailyActivityCounts(userId: number): Promise<any> {
    const query = `
      SELECT DATE(completed_at) AS day, 'todos' AS type, COUNT(*) AS count
      FROM todos
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY day

      UNION ALL

      SELECT DATE(given_at) AS day, 'blogs' AS type, COUNT(*) AS count
      FROM blogs
      WHERE given_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY day

      UNION ALL

      SELECT DATE(completed_at) AS day, 'goals' AS type, COUNT(*) AS count
      FROM goals
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY day

      UNION ALL

      SELECT DATE(created_at) AS day, 'habits' AS type, COUNT(*) AS count
      FROM habits_trackers
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY day

      UNION ALL

      SELECT DATE(created_at) AS day, 'qaas' AS type, COUNT(*) AS count
      FROM qaas
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY day;
    `;

    const res = await this.database.query(query);

    // Initialize an empty object to hold the grouped data
    const groupedData = {};

    // Transform the data into the desired format
    res.rows.forEach((row) => {
      const { day, type, count } = row;
      const formattedDate = format(new Date(day), 'yyyy-MM-dd');

      // If the date doesn't exist in the groupedData, create an empty object for it
      if (!groupedData[formattedDate]) {
        groupedData[formattedDate] = {};
        groupedData[formattedDate].total = 0;
      }

      // Assign the count to the specific type (e.g., todos, blogs) for that date
      groupedData[formattedDate][type] = parseInt(count, 10); // Convert count to a number
      groupedData[formattedDate].total += parseInt(count, 10);
    });

    return groupedData;
  }

  async getMonthlyActivityCounts(userId: number): Promise<any> {
    const query = `
      SELECT TO_CHAR(completed_at, 'YYYY-MM') AS month, 'todos' AS type, COUNT(*) AS count
      FROM todos
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY month
  
      UNION ALL
  
      SELECT TO_CHAR(given_at, 'YYYY-MM') AS month, 'blogs' AS type, COUNT(*) AS count
      FROM blogs
      WHERE given_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY month
  
      UNION ALL
  
      SELECT TO_CHAR(completed_at, 'YYYY-MM') AS month, 'goals' AS type, COUNT(*) AS count
      FROM goals
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY month
  
      UNION ALL
  
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, 'habits' AS type, COUNT(*) AS count
      FROM habits_trackers
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY month
  
      UNION ALL
  
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, 'qaas' AS type, COUNT(*) AS count
      FROM qaas
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY month;
    `;

    const res = await this.database.query(query);

    // Initialize an empty object to hold the grouped data
    const groupedData: { [key: string]: any } = {};

    // Transform the data into the desired format
    res.rows.forEach((row) => {
      const { month, type, count } = row;

      // If the month doesn't exist in the groupedData, create an empty object for it
      if (!groupedData[month]) {
        groupedData[month] = {};
        groupedData[month].total = 0;
      }

      // Assign the count to the specific type (e.g., todos, blogs) for that month
      groupedData[month][type] = parseInt(count, 10); // Convert count to a number
      groupedData[month].total += parseInt(count, 10);
    });

    return groupedData;
  }

  async getYearlyActivityCounts(userId: number): Promise<any> {
    const query = `
      SELECT TO_CHAR(completed_at, 'YYYY') AS year, 'todos' AS type, COUNT(*) AS count
      FROM todos
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY year
  
      UNION ALL
  
      SELECT TO_CHAR(given_at, 'YYYY') AS year, 'blogs' AS type, COUNT(*) AS count
      FROM blogs
      WHERE given_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY year
  
      UNION ALL
  
      SELECT TO_CHAR(completed_at, 'YYYY') AS year, 'goals' AS type, COUNT(*) AS count
      FROM goals
      WHERE completed_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY year
  
      UNION ALL
  
      SELECT TO_CHAR(created_at, 'YYYY') AS year, 'habits' AS type, COUNT(*) AS count
      FROM habits_trackers
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY year
  
      UNION ALL
  
      SELECT TO_CHAR(created_at, 'YYYY') AS year, 'qaas' AS type, COUNT(*) AS count
      FROM qaas
      WHERE created_at IS NOT NULL
      AND user_id = ${userId}
      GROUP BY year;
    `;

    const res = await this.database.query(query);

    // Initialize an empty object to hold the grouped data
    const groupedData: { [key: string]: any } = {};

    // Transform the data into the desired format
    res.rows.forEach((row) => {
      const { year, type, count } = row;

      // If the year doesn't exist in the groupedData, create an empty object for it
      if (!groupedData[year]) {
        groupedData[year] = {};
        groupedData[year].total = 0;
      }

      // Assign the count to the specific type (e.g., todos, blogs) for that year
      groupedData[year][type] = parseInt(count, 10); // Convert count to a number
      groupedData[year].total += parseInt(count, 10);
    });

    return groupedData;
  }
}
