import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { QaaService } from './qaa.service';
import { QaaDto } from 'src/dto/qaa.dto'; // Adjust the import based on your actual file structure
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Qaa')
@Controller('qaa')
export class QaaController {
  constructor(private readonly qaaService: QaaService) {}

  @Get()
  async getAllQaa() {
    const qaaList = await this.qaaService.getAllQaa();
    return qaaList;
  }

  @Get('latest')
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'showRemoved', required: false })
  async getLatestQaas(
    @Query('type') type?: string,
    @Query('showRemoved') showRemoved?: string,
  ) {
    const qaaList = await this.qaaService.getLatestQaas(type, showRemoved);
    return qaaList;
  }

  @Get('groupedByDate')
  async getQaasGroupedByDate(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const qaaList = await this.qaaService.getAllQaasGroupedByDate(from, to);
    return qaaList;
  }

  @Get('getById/:id')
  async getQaaById(@Param('id') id: number) {
    try {
      const qaa = await this.qaaService.getQaaById(id);
      return qaa;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching Qaa: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: QaaDto })
  @ApiResponse({ status: 201, description: 'Qaa created', type: QaaDto })
  async createQaa(@Body() body: QaaDto) {
    const newQaa = await this.qaaService.insertQaa(body);

    return { message: 'Qaa created successfully', qaa: newQaa };
  }

  @Put(':id')
  async updateQaa(@Param('id') id: number, @Body() updatedQaa: QaaDto) {
    try {
      const updated = await this.qaaService.updateQaa(id, updatedQaa);
      return { message: 'Qaa updated successfully', qaa: updated };
    } catch (error) {
      throw new HttpException(
        'Error updating Qaa: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('remove/:id')
  async removeQaa(@Param('id') id: number) {
    try {
      const qaa = await this.qaaService.removeQaa(id);
      return { message: 'Qaa removed successfully', qaa };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to remove qaa' };
    }
  }

  @Delete(':id')
  async deleteQaa(@Param('id') id: number) {
    try {
      const deleted = await this.qaaService.deleteQaa(id);
      return { message: 'Qaa deleted successfully', qaa: deleted };
    } catch (error) {
      throw new HttpException(
        'Error deleting Qaa: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
