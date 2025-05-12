"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.TagsModel = exports.ContentModel = exports.LinkModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const Users = new mongoose_2.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const Tags = new mongoose_2.Schema({
    title: String
});
const TagsModel = mongoose_1.default.model("Tags", Tags);
exports.TagsModel = TagsModel;
const UserModel = mongoose_1.default.model("User", Users);
exports.UserModel = UserModel;
const Content = new mongoose_2.Schema({
    link: String,
    type: { type: String },
    title: String,
    description: String,
    qdrantId: { type: String, required: true }, // ✅ Add this line
    tags: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Tags" }],
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true }
});
const Link = new mongoose_2.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true }
});
const LinkModel = mongoose_1.default.model("Link", Link);
exports.LinkModel = LinkModel;
const ContentModel = mongoose_1.default.model("Content", Content);
exports.ContentModel = ContentModel;
// module.exports={
// LinkModel:LinkModel,
// ContentModel:ContentModel,
// TagsModel:TagsModel,
// UserModel:UserModel
// }
"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";
