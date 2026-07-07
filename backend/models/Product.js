import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    lifestyle: {
      type: String,
      trim: true,
      default: "",
    },
    weight: { type: String, default: "" },
    unit: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    mrp: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },

    mfgDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    description: { type: String, default: "" },

    image: { type: String, default: "" },

    public_id: { type: String, default: "" },

    isOutOfStock: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({
  lifestyle: 1,
});

productSchema.pre("save", function () {
  this.isOutOfStock = this.stock <= 0;
});

productSchema.virtual("discountPercentage").get(function () {
  if (!this.price || !this.discountPrice) return 0;

  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
