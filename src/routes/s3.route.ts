import S3Controller from '@/controllers/s3.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
import S3Service from '@/services/s3.service';
import { Router } from 'express';
const s3ControllerInstance = new S3Controller(new S3Service());
const router: Router = Router();

router
    .route('/thumbnail')
    .post(
        authenticationComposer,
        s3ControllerInstance.postSignedUrlS3Thumbnail.bind(
            s3ControllerInstance,
        ),
    );

router
    .route('/audio')
    .post(
        authenticationComposer,
        s3ControllerInstance.postSignedUrlS3Audio.bind(s3ControllerInstance),
    );

export default router;
