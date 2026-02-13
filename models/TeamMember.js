const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true,
        maxlength: [100, 'Role cannot exceed 100 characters']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    image: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Basic URL validation
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Image must be a valid URL'
        }
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
TeamMemberSchema.index({ name: 1 });
TeamMemberSchema.index({ active: 1, order: 1 });

// Virtual for formatted creation date
TeamMemberSchema.virtual('formattedCreatedAt').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Ensure virtuals are included in JSON
TeamMemberSchema.set('toJSON', { virtuals: true });
TeamMemberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
