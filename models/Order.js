import mongoose from 'mongoose';

const PlaceOrder = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel',
    },
    roomDetail: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Room',
        },
        title: { type: String },
        maxPeople: { type: Number },
        price: { type: Number },
        qty: { type: Number },
      },
    ],
    roomReserve: [
      {
        roomNumber: { type: String, required: true },
        numberId: {
          type: String,
          required: true,
        },
      },
    ],
    dateNumber: [
      {
        type: Number,
      },
    ],
    roomsPrice: {
      type: Number,
      required: true,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    request: {
      type: String,
    },
    confirm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Order', PlaceOrder);
