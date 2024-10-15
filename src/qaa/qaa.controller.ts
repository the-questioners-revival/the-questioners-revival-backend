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
  UseGuards,
  Request,
} from '@nestjs/common';
import { QaaService } from './qaa.service';
import { QaaDto } from 'src/dto/qaa.dto'; // Adjust the import based on your actual file structure
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Qaa')
@Controller('qaa')
export class QaaController {
  constructor(private readonly qaaService: QaaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllQaa(@Request() req) {
    const qaaList = await this.qaaService.getAllQaa(req.user.id);
    return qaaList;
  }

  @Get('latest')
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'showRemoved', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestQaas(
    @Request() req,
    @Query('type') type?: string,
    @Query('showRemoved') showRemoved?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const qaaList = await this.qaaService.getLatestQaas(
      req.user.id,
      type,
      showRemoved,
      limit,
      offset,
    );
    return qaaList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getQaasGroupedByDate(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const qaaList = await this.qaaService.getAllQaasGroupedByDate(
      req.user.id,
      from,
      to,
    );
    return qaaList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getQaaById(@Request() req, @Param('id') id: number) {
    try {
      const qaa = await this.qaaService.getQaaById(req.user.id, id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createQaa(@Request() req, @Body() body: QaaDto) {
    const newQaa = await this.qaaService.insertQaa(req.user.id, body);

    return { message: 'Qaa created successfully', qaa: newQaa };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateQaa(
    @Request() req,
    @Param('id') id: number,
    @Body() updatedQaa: QaaDto,
  ) {
    try {
      const updated = await this.qaaService.updateQaa(
        req.user.id,
        id,
        updatedQaa,
      );
      return { message: 'Qaa updated successfully', qaa: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeQaa(@Request() req, @Param('id') id: number) {
    try {
      const qaa = await this.qaaService.removeQaa(req.user.id, id);
      return { message: 'Qaa removed successfully', qaa };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteQaa(@Request() req, @Param('id') id: number) {
    try {
      const deleted = await this.qaaService.deleteQaa(req.user.id, id);
      return { message: 'Qaa deleted successfully', qaa: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
