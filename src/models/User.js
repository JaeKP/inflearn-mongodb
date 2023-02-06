import { Schema, model } from "mongoose";

// new mongoose.Schema(스케마 정의, 옵션)
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    age: Number,
    email: String,
  },
  { timestamps: true }
);

// 만든 스케마를 몽구스에게 알려주어 모델을 생성한다.
// model(콜렉션이름, 스키마)
const User = model("user", UserSchema);

export default User;
