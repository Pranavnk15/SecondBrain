import mongoose from "mongoose";
declare const TagsModel: mongoose.Model<{
    title?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    title?: string | null | undefined;
}, {}> & {
    title?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    title?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    title?: string | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    title?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const UserModel: mongoose.Model<{
    username: string;
    email: string;
    password: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    username: string;
    email: string;
    password: string;
}, {}> & {
    username: string;
    email: string;
    password: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    email: string;
    password: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    username: string;
    email: string;
    password: string;
}>, {}> & mongoose.FlatRecord<{
    username: string;
    email: string;
    password: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const LinkModel: mongoose.Model<{
    userId: mongoose.Types.ObjectId;
    hash: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: mongoose.Types.ObjectId;
    hash: string;
}, {}> & {
    userId: mongoose.Types.ObjectId;
    hash: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    userId: mongoose.Types.ObjectId;
    hash: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: mongoose.Types.ObjectId;
    hash: string;
}>, {}> & mongoose.FlatRecord<{
    userId: mongoose.Types.ObjectId;
    hash: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
declare const ContentModel: mongoose.Model<{
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
}, {}> & {
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    qdrantId: string;
    tags: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    type?: string | null | undefined;
    title?: string | null | undefined;
    link?: string | null | undefined;
    description?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export { LinkModel, ContentModel, TagsModel, UserModel };
