import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    username: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const HotelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['hotel', 'apartment', 'resort', 'villas', 'cabins'],
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photo: {
      type: [
        {
          url: { type: String },
          public_id: { type: String },
        },
      ],
    },
    distance: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    numReviews: {
      type: String,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    cheapestPrice: {
      type: Number,
      required: true,
    },
    featured: {
      type: Boolean,
    },
    rooms: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Hotel', HotelSchema);
