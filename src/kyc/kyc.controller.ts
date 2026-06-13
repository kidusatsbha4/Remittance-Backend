import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req, ClassSerializerInterceptor// ✅ UPDATED
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import { AuthGuard } from '../auth/auth.guard';
import { multerConfig } from '../common/config/multer.config';

@UseInterceptors(ClassSerializerInterceptor) // Enables the @Exclude() decorator

@Controller('kyc')
//  @UseGuards(AuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'id_photo', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ],
    multerConfig,
  ),
)
// @UseInterceptors(
//   FileInterceptor('file', {
//     limits: {
//       fileSize: 5 * 1024 * 1024,
//     },

//     fileFilter(req, file, cb) {
//       const allowed = [
//         'image/jpeg',
//         'image/png',
//         'application/pdf',
//       ];

//       cb(
//         null,
//         allowed.includes(file.mimetype),
//       );
//     },
//   }),
// )

// @Throttle({
//   default: {
//     ttl: 60_000,
//     limit: 5, // very strict
//   },
// })

create(
  @Body() body,
  @UploadedFiles() files,
  @Req() req, // ✅ UPDATED
) {
  // const userId = req.user.sub; // ✅ GET FROM JWT
 const userId = 5; // ✅ GET FROM JWT
  return this.kycService.create(
    { ...body, user_id: userId }, // ✅ inject user_id
    files,
  );
}

  // ✅ UPDATED
  @Get()
  findAll(@Query() query, @Req() req) {
    return this.kycService.findAll(query, req);
  }

  // ✅ UPDATED: use findOneWithUrl
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.kycService.findOneWithUrl(+id, req);
  }

  @Patch(':id')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'id_photo', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ],
    multerConfig,
  ),
)
update(
  @Param('id') id: string,
  @Body() body,
  @UploadedFiles() files,
) {
  return this.kycService.update(+id, body, files); // ✅ UPDATED
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kycService.remove(+id);
  }

  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.kycService.verify(+id);
  }

  @Patch(':id/unverify')
  unverify(@Param('id') id: string) {
    return this.kycService.unverify(+id);
  }
}