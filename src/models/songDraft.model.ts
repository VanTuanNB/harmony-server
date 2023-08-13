import {
    ISong,
    ISongDraftUpload,
} from '@/constraints/interfaces/ICollection.interface';
import songDraftSchema from '@/database/schemas/songDraft.schema';

export default class SongDraftModel {
    public async getById(_id: string): Promise<ISongDraftUpload | null> {
        return await songDraftSchema.findById(_id);
    }

    public async getUserId(
        userReference: string,
    ): Promise<ISongDraftUpload | null> {
        return await songDraftSchema.findOne({ userReference: userReference });
    }

    public async create(payload: ISongDraftUpload): Promise<ISongDraftUpload> {
        return await songDraftSchema.create(payload);
    }

    public async updateField(
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

    public async forceDelete(_id: string): Promise<ISong | null> {
        return await songDraftSchema.findByIdAndDelete(_id);
    }
}

// ngày mai sẽ làm phần tiếp theo của s3:
//  + update một song thì update field trong collection song. -> done
//  + delete ở trên s3 đồng thời cũng delete trên db; -> thiếu phần playlist
//  + create song thì cũng phải thêm id vào listSong những collection liên quan
//  + get song thì trả về json
//  + get stream thì trả về pipe stream
//  + get thumbnail thì gọi lên api server, server sẽ gọi lên s3, xong lấy
//  + thiếu playlist module
//  file content đọc và trả về bằng res.pipe
