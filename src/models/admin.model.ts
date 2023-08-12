import { IAdmin } from '@/constraints/interfaces/index.interface';
import adminSchema from '@/database/schemas/admin.schema';

export default class AdminModel {
    public async getByEmail(email: string): Promise<IAdmin | null> {
        return await adminSchema.findOne({ email });
    }

    public async getById(_id: string): Promise<IAdmin | null> {
        return await adminSchema.findOne({ _id });
    }

    public async create(payload: IAdmin): Promise<IAdmin> {
        return await adminSchema.create(payload);
    }

    public async update(
        _id: string,
        payload: Partial<Omit<IAdmin, '_id'>>,
    ): Promise<IAdmin | null> {
        return await adminSchema.findByIdAndUpdate(_id, payload);
    }

    public async deleteById(_id: string): Promise<IAdmin | null> {
        return await adminSchema.findByIdAndDelete(_id);
    }
}
