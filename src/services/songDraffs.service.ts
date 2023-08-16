import { currentStep } from '@/constraints/enums/currentStep.enum';
import { ISongDraftUpload } from '@/constraints/interfaces/ICollection.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { songDraftModel } from '@/instances/index.instance';

export default class SongDraftService {
    constructor() {}

    public async getListSongDraftById(
        userId: string,
    ): Promise<CustomResponse<ISongDraftUpload & { currentStep: string }>> {
        try {
            const songDraft = await songDraftModel.getUserId(userId);

            if (!songDraft)
                return {
                    status: 400,
                    success: false,
                    message: 'SONG_DRAFTS_NOT_FOUND',
                };

            if (songDraft.thumbnail === null) {
                return {
                    status: 200,
                    success: false,
                    message: 'GET_SONG_DRAFT_SUCCESSFULLY',
                    data: {
                        ...songDraft,
                        currentStep: currentStep.THUMBNAIL,
                    },
                };
            } else {
                return {
                    status: 200,
                    success: false,
                    message: 'GET_SONG_DRAFT_SUCCESSFULLY',
                    data: {
                        ...songDraft,
                        currentStep: currentStep.INFORMATION,
                    },
                };
            }
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_SONG_DRAFFS_BY_ID_FAILED',
            };
        }
    }
}
