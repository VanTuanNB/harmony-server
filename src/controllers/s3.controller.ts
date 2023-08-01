import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { IPayloadRequestSignedUrlS3 } from '@/constraints/interfaces/common.interface';
import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/IsRequirementRequest.decorator';
import S3Service from '@/services/s3.service';
import { Response } from 'express';

export default class S3Controller {
    constructor(private s3Service: S3Service) {}

    public async postSignedUrlS3Audio(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const signedUrlS3Service =
            await this.s3Service.getSignUrlForUploadAudioS3(userId ?? '');
        return res.status(200).json(signedUrlS3Service);
    }

    @IsRequirementReq(['uploadId', 'contentType'], 'body')
    public async postSignedUrlS3Thumbnail(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const { uploadId, contentType } = req.body as {
            uploadId: string;
            contentType:
                | EContentTypeObjectS3.JPEG
                | EContentTypeObjectS3.PNG
                | EContentTypeObjectS3.JPG;
        };
        const signedUrlS3Service =
            await this.s3Service.getSignUrlForUploadThumbnailS3(
                userId ?? '',
                uploadId,
                contentType,
            );
        return res.status(200).json(signedUrlS3Service);
    }
}
