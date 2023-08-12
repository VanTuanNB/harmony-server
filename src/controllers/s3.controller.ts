import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { IPayloadRequestSignedUrlS3 } from '@/constraints/interfaces/common.interface';
import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/IsRequirementRequest.decorator';
import { s3Service } from '@/instances/index.instance';
import { Response } from 'express';

export default class S3Controller {
    constructor() {}

    public async postSignedUrlS3Audio(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const signedUrlS3Service = await s3Service.getSignUrlForUploadAudioS3(
            userId ?? '',
        );
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
            await s3Service.getSignUrlForUploadThumbnailS3(
                userId ?? '',
                uploadId,
                contentType,
            );
        return res.status(200).json(signedUrlS3Service);
    }

    @IsRequirementReq(['albumId', 'contentType'], 'body')
    public async postSignedUrlS3Album(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const { albumId, contentType } = req.body as {
            albumId: string;
            contentType:
                | EContentTypeObjectS3.JPEG
                | EContentTypeObjectS3.PNG
                | EContentTypeObjectS3.JPG;
        };
        const signedUrlS3Service = await s3Service.getSignUrlForUploadAlbum(
            userId ?? '',
            albumId,
            contentType,
        );
        return res.status(200).json(signedUrlS3Service);
    }

    @IsRequirementReq('contentType', 'body')
    public async postSignedUrlS3UserAvatar(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const { contentType } = req.body as {
            contentType:
                | EContentTypeObjectS3.JPEG
                | EContentTypeObjectS3.PNG
                | EContentTypeObjectS3.JPG;
        };
        const signedUrlS3Service =
            await s3Service.getSignUrlForUploadUserAvatar(
                userId ?? '',
                contentType,
            );
        return res.status(200).json(signedUrlS3Service);
    }
}
