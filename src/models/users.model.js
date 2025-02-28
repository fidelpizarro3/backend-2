import { Schema, model } from "mongoose";
import userDao from "../daos/user.dao.js";

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  role: {
    type : String,
    enum: ['user','admin'],
    default: 'user',
  },
});

export default model("User", UserSchema);