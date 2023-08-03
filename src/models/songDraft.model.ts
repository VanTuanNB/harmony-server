import { ISongDraftUpload } from '@/constraints/interfaces/ICollection.interface';
import songDraftSchema from '@/database/schemas/songDraft.schema';

export default class songDraftModel {
    public static async getById(_id: string): Promise<ISongDraftUpload | null> {
        return await songDraftSchema.findById(_id);
    }

    public static async getUserId(userReference: string): Promise<ISongDraftUpload | null> {
        return await songDraftSchema.findOne({userReference: userReference});
    }

    public static async create(
        payload: ISongDraftUpload,
    ): Promise<ISongDraftUpload> {
        return await songDraftSchema.create(payload);
    }

    public static async updateField(
        _id: string,
        payload: Partial<Omit<ISongDraftUpload, '_id'>>,
    ): Promise<ISongDraftUpload | null> {
        return await songDraftSchema.findByIdAndUpdate(
            _id,
            {
                $set: {
                    'audio.bucketName': payload.audio
                        ? payload.audio.bucketName
                        : undefined,
                    'audio.keyObject': payload.audio
                        ? payload.audio.keyObject
                        : undefined,
                    'audio.contentType': payload.audio
                        ? payload.audio.contentType
                        : undefined,
                    'audio.expiredTime': payload.audio
                        ? payload.audio.expiredTime
                        : undefined,
                    thumbnail: {
                        bucketName: payload.thumbnail
                            ? payload.thumbnail.bucketName
                            : undefined,
                        keyObject: payload.thumbnail
                            ? payload.thumbnail.keyObject
                            : undefined,
                        contentType: payload.thumbnail
                            ? payload.thumbnail.contentType
                            : undefined,
                        expiredTime: payload.thumbnail
                            ? payload.thumbnail.expiredTime
                            : undefined,
                    },
                    updatedAt: new Date().toUTCString(),
                },
            },
            {
                new: true,
            },
        );
    }
}
