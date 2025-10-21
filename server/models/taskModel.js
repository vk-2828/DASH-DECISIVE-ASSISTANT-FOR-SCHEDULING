const mongoose = require('mongoose');

// This sub-schema defines the structure for each alarm object
const alarmSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  repeatDaily: {
    type: Boolean,
    default: false
  }
}, { _id: false }); // _id: false prevents subdocuments from getting their own ID

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    priority: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
    },
    dueDate: {
        type: Date,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    // The alarms field now uses our new sub-schema
    alarms: [alarmSchema],
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

// Use module.exports instead of 'export default'
module.exports = Task;