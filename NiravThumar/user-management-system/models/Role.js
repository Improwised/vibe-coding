const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Ensure name is lowercase
roleSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase();
  }
  next();
});

// Static method to find role by name
roleSchema.statics.findByName = function (name) {
  return this.findOne({ name: name.toLowerCase() });
};

module.exports = mongoose.model('Role', roleSchema);
