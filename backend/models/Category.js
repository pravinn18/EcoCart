import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    public_id: String,
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
