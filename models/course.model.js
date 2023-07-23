import { Schema, model } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [5, "Title must be at least 5 characters"],
      maxLength: [60, "Title should be less than 60 characters"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [50, "Description must be at least 50 characters"],
      maxLength: [200, "Description should be less than 200 characters"],
      trim: true,
    },

    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },

    thumbnail: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },

    lectures: [
      {
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
          },
          secure_url: {
            type: String,
          },
        },
      },
    ],

    numberOfLectures: {
      type: Number,
      default: 0
    },

    createdBy: {
      type: String,
      required: [true, 'Mentor is required']
    },
  },
  {
    timestamps: true,
  }
);

const Course = model('Course', courseSchema);

export default Course;