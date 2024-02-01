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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoDto } from 'src/dto/todo.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Todo')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getAllTodos() {
    const todos = await this.todoService.getAllTodos();
    return todos;
  }

  @Get('latest')
  async getLatestTodos() {
    const todoList = await this.todoService.getLatestTodos();
    return todoList;
  }

  @Get('groupedByDate')
  async getTodosGroupedByDate() {
    const todoList = await this.todoService.getAllTodosGroupedByDate();
    return todoList;
  }

  @Get('9gag2')
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
        fs.writeFileSync('./src/todo/allComments.json', JSON.stringify(comments, null, 2));
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
    const apiFirstUrl =
      `https://comment-cdn.9gag.com/v2/cacheable/comment-list.json?appId=a_dd8f2b7d304a10edaf6f29517ea0ca4100a43d1b&count=10000&type=hot&viewMode=list&postKey=${postKey}&url=http%3A%2F%2F9gag.com%2Fgag%2F${postKey}&origin=https%3A%2F%2F9gag.com`;

    // Start the process with the initial API URL
    getAllComments(apiUrl, apiFirstUrl);
  }

  @Get('getById/:id')
  async getTodoById(@Param('id') id: number) {
    try {
      const todo = await this.todoService.getTodoById(id);
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
  async createTodo(@Body() body: TodoDto) {
    const newTodo = await this.todoService.insertTodo(body);

    return { message: 'Todo created successfully', todo: newTodo };
  }

  @Put(':id')
  async updateTodo(@Param('id') id: number, @Body() updatedTodo: TodoDto) {
    try {
      const updated = await this.todoService.updateTodo(id, updatedTodo);
      return { message: 'Todo updated successfully', todo: updated };
    } catch (error) {
      throw new HttpException(
        'Error updating todo: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('complete/:id')
  async completeTodo(@Param('id') id: number) {
    try {
      const todo = await this.todoService.completeTodo(id);
      return { message: 'Todo completed successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to complete todo' };
    }
  }

  @Post('inprogress/:id')
  async inprogressTodo(@Param('id') id: number) {
    try {
      const todo = await this.todoService.inprogressTodo(id);
      return { message: 'Todo marked as in progress successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to mark todo as in progress' };
    }
  }

  @Post('remove/:id')
  async removeTodo(@Param('id') id: number) {
    try {
      const todo = await this.todoService.removeTodo(id);
      return { message: 'Todo removed successfully', todo };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to remove todo' };
    }
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: number) {
    try {
      const deleted = await this.todoService.deleteTodo(id);
      return { message: 'Todo deleted successfully', todo: deleted };
    } catch (error) {
      throw new HttpException(
        'Error deleting todo: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
