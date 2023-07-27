import { IPayloadRequestSignedUrlS3 } from '@/constraints/interfaces/common.interface';
import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/IsRequirementRequest.decorator';
import S3Service from '@/services/s3.service';
import { Response } from 'express';

export default class S3Controller {
    constructor(private s3Service: S3Service) {}

    @IsRequirementReq(['method', 'key'], 'body')
    public async signedUrlS3(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: IPayloadRequestSignedUrlS3 = req.body;
        const signedUrlS3Service = await this.s3Service.signedUrlS3(payload);
        return res.status(200).json(signedUrlS3Service);
    }

    public async postSignedUrlS3Audio(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const signedUrlS3Service =
            await this.s3Service.getSignUrlForUploadAudioS3();
        return res.status(200).json(signedUrlS3Service);
    }
}
