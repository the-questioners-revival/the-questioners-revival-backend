import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoDto } from 'src/dto/todo.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Todo')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllTodos(@Request() req) {
    const todos = await this.todoService.getAllTodos(req.user.id);
    return todos;
  }

  @Get('latest')
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestTodos(
    @Request() req,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const todoList = await this.todoService.getLatestTodos(
      req.user.id,
      type,
      status,
      priority,
    );
    return todoList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTodosGroupedByDate(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const todoList = await this.todoService.getAllTodosGroupedByDate(
      req.user.id,
      from,
      to,
    );
    return todoList;
  }

  @Get('9gag2')
  @UseGuards(JwtAuthGuard)
  async get9GagCommentsPictures() {
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');

    async function downloadImage(url, filePath) {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(fs.createWriteStream(filePath));

      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(''));
        response.data.on('error', (error) => reject(error));
      });
    }

    async function downloadImagesFromJson(jsonFilePath) {
      const imageFolder = 'images'; // Create a folder to store downloaded images

      if (!fs.existsSync(imageFolder)) {
        fs.mkdirSync(imageFolder);
      }

      const comments = require(jsonFilePath);

      for (const comment of comments) {
        if (
          comment.media &&
          comment.media[0] &&
          comment.media[0].imageMetaByType
        ) {
          const imageUrl = comment.media[0].imageMetaByType.animated
            ? comment.media[0].imageMetaByType.animated.url
            : comment.media[0].imageMetaByType.image.url;
          const imageFileName = path.basename(imageUrl);
          const imagePath = path.join(imageFolder, imageFileName);

          // Download and save the image
          await downloadImage(imageUrl, imagePath);
          console.log(`Image downloaded: ${imageFileName}`);
        }
      }

      console.log('All images downloaded successfully.');
    }

    // Replace 'yourComments.json' with the actual file path containing your comments
    downloadImagesFromJson(
      '/Users/jozefmaloch/Main/github/the-questioners-revival/the-questioners-revival-backend/src/todo/allComments.json',
    );
  }

  @Post('9gag/:url')
  @UseGuards(JwtAuthGuard)
  async get9GagComments(@Param('url') url: string) {
    const postKey = url.split('/').pop();
    const axios = require('axios');
    const fs = require('fs');
    let count = 1;
    async function getAllComments(url, apiFirstUrl, comments = []) {
      try {
        const response = await axios.get(count === 1 ? apiFirstUrl : url);
        const { data } = response;
        count++;
        console.log('data.comments: ', data.payload.comments.length);
        console.log('data.payload: ', data.payload.next);

        // Concatenate the new comments with the existing ones
        comments = comments.concat(data.payload.comments);

        // If there is a "next" property, make a recursive call
        if (data.payload.next) {
          return getAllComments(
            url + '' + data.payload.next,
            apiFirstUrl,
            comments,
          );
        }

        // If there is no "next" property, save the comments to a file
        fs.writeFileSync(
          './src/todo/allComments.json',
          JSON.stringify(comments, null, 2),
        );
        console.log('All comments saved successfully.');
        return comments;
      } catch (error) {
        console.error('Error fetching comments:', error.message);
        throw error;
      }
    }

    // Replace 'YOUR_API_URL' with the actual API endpoint
    const apiUrl =
      'https://comment-cdn.9gag.com/v2/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&count=10000&';
    const apiFirstUrl = `https://comment-cdn.9gag.com/v2/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&count=10000&type=hot&viewMode=list&postKey=${postKey}&url=http%3A%2F%2F9gag.com%2Fgag%2F${postKey}&origin=https%3A%2F%2F9gag.com`;

    // Start the process with the initial API URL
    getAllComments(apiUrl, apiFirstUrl);
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTodoById(@Request() req, @Param('id') id: number) {
    try {
      const todo = await this.todoService.getTodoById(req.user.id, id);
      return todo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching todo: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: TodoDto })
  @ApiResponse({ status: 201, description: 'Todo created', type: TodoDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createTodo(@Request() req, @Body() body: TodoDto) {
    const newTodo = await this.todoService.insertTodo(req.user.id, body);

    return { message: 'Todo created successfully', todo: newTodo };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateTodo(
    @Request() req,
    @Param('id') id: number,
    @Body() updatedTodo: TodoDto,
  ) {
    try {
      const updated = await this.todoService.updateTodo(
        req.user.id,
        id,
        updatedTodo,
      );
      return { message: 'Todo updated successfully', todo: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('complete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async completeTodo(@Request() req, @Param('id') id: number) {
    try {
      const todo = await this.todoService.completeTodo(req.user.id, id);
      return { message: 'Todo completed successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Post('inprogress/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async inprogressTodo(@Request() req, @Param('id') id: number) {
    try {
      const todo = await this.todoService.inprogressTodo(req.user.id, id);
      return { message: 'Todo marked as in progress successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeTodo(@Request() req, @Param('id') id: number) {
    try {
      const todo = await this.todoService.removeTodo(req.user.id, id);
      return { message: 'Todo removed successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteTodo(@Request() req, @Param('id') id: number) {
    try {
      const deleted = await this.todoService.deleteTodo(req.user.id, id);
      return { message: 'Todo deleted successfully', todo: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
