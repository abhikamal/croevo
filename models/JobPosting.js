const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    type: {
        type: String,
        enum: {
            values: ['Full-time', 'Part-time', 'Contract', 'Internship'],
            message: '{VALUE} is not a valid job type'
        },
        required: [true, 'Job type is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    applyUrl: {
        type: String,
        required: [true, 'Apply URL is required'],
        trim: true,
        validate: {
            validator: function (v) {
                // Basic URL validation
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Apply URL must be a valid URL'
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'filled'],
        default: 'active'
    },
    deadline: {
        type: Date
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
JobPostingSchema.index({ title: 1, type: 1 });
JobPostingSchema.index({ location: 1 });
JobPostingSchema.index({ status: 1, order: 1 });

// Virtual for checking if deadline has passed
JobPostingSchema.virtual('isExpired').get(function () {
    return this.deadline && this.deadline < new Date();
});

// Virtual for formatted deadline
JobPostingSchema.virtual('formattedDeadline').get(function () {
    return this.deadline ? this.deadline.toLocaleDateString() : null;
});

// Ensure virtuals are included in JSON
JobPostingSchema.set('toJSON', { virtuals: true });
JobPostingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JobPosting', JobPostingSchema);
