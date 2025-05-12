import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ObjectId } from "mongoose";


const Users = new Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true }, 
  password: { type: String, required: true }
});


const Tags = new Schema({
    title:String
})

const TagsModel = mongoose.model("Tags",Tags);
const UserModel = mongoose.model("User",Users);

const Content = new Schema({
  link: String,
  type: { type: String },
  title: String,
  description: String,

  qdrantId: { type: String, required: true }, // ✅ Add this line

  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tags" }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const Link  = new Schema ({
    hash: { type: String, required: true },
    userId: {  type: mongoose.Schema.Types.ObjectId, ref: "User", required:true, unique:true } 
})

const LinkModel =  mongoose.model("Link",Link);
const ContentModel  = mongoose.model("Content",Content);


export { LinkModel, ContentModel, TagsModel, UserModel };

// module.exports={
// LinkModel:LinkModel,
// ContentModel:ContentModel,
// TagsModel:TagsModel,
// UserModel:UserModel
// }

"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"