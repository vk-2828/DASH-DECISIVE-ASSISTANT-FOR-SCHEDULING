const cron = require('node-cron');
const Task = require('../models/taskModel');
const Notification = require('../models/notificationModel');
const { sendEmail } = require('./emailService');

// --- NEW: Function to permanently purge old tasks from the trash ---
const purgeOldTasks = async () => {
    try {
        // Calculate the date 7 days ago
        const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

        // Find tasks that are:
        // 1. In the trash (isDeleted: true)
        // 2. Their due date passed more than 7 days ago
        const tasksToDelete = await Task.find({
            isDeleted: true,
            dueDate: { $lt: oneWeekAgo } // $lt means "less than"
        });

        if (tasksToDelete.length > 0) {
            console.log(`Found ${tasksToDelete.length} old tasks to purge permanently.`);
            const idsToDelete = tasksToDelete.map(task => task._id);
            
            // Perform a single, efficient operation to delete all matched tasks
            await Task.deleteMany({ _id: { $in: idsToDelete } });
        }
    } catch (error) {
        console.error('Error during old task purge:', error);
    }
};

// --- This is the existing function to move overdue tasks to trash ---
const cleanupOverdueTasks = async () => {
    const now = new Date();
    try {
        const overdueTasks = await Task.find({
            isDeleted: false,
            dueDate: { $lt: now } 
        });

        if (overdueTasks.length > 0) {
            console.log(`Found ${overdueTasks.length} overdue tasks to move to trash.`);
            const idsToMove = overdueTasks.map(task => task._id);
            await Task.updateMany(
                { _id: { $in: idsToMove } },
                { $set: { isDeleted: true } } 
            );
        }
    } catch (error) {
        console.error('Error during overdue task cleanup:', error);
    }
};

const startReminderService = () => {
    console.log('Advanced reminder and cleanup service scheduled to run every minute.');
    
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        console.log(`[${now.toLocaleTimeString()}] Running service checks...`);

        // --- Execute ALL THREE functions every minute ---
        await handleReminders(now, currentHour, currentMinute);
        await cleanupOverdueTasks();
        await purgeOldTasks(); // NEW function is called here
    });
};

// The function to handle sending reminders (no changes)
const handleReminders = async (now, currentHour, currentMinute) => {
    try {
        // Find one-time tasks
        const oneTimeTasks = await Task.find({
            isCompleted: false, isDeleted: false, 'alarms.repeatDaily': false,
            'alarms.time': { $gte: now, $lt: new Date(now.getTime() + 60 * 1000) }
        }).populate('user');

        // Find daily tasks
        const dailyTasks = await Task.find({
            isCompleted: false, isDeleted: false, 'alarms.repeatDaily': true,
        }).populate('user');

        const allTasksToRemind = [...oneTimeTasks];
        dailyTasks.forEach(dailyTask => {
            const shouldRemind = dailyTask.alarms.some(alarm => 
                alarm.repeatDaily &&
                new Date(alarm.time).getHours() === currentHour &&
                new Date(alarm.time).getMinutes() === currentMinute
            );
            if (shouldRemind && !allTasksToRemind.find(t => t._id.equals(dailyTask._id))) {
                allTasksToRemind.push(dailyTask);
            }
        });

        if (allTasksToRemind.length > 0) {
            console.log(`Found ${allTasksToRemind.length} tasks with reminders.`);
            for (const task of allTasksToRemind) {
                if (task.user) {
                    const reminderMessage = `Reminder for your task: "${task.title}".`;
                    await Notification.create({ user: task.user._id, message: reminderMessage });
                    await sendEmail(task.user.email, `🔔 Quick Reminder: ${task.title}`, `Hi ${task.user.name}, ${reminderMessage}`);
                }
            }
        }
    } catch (error) {
        console.error('Error handling reminders:', error);
    }
};

module.exports = { startReminderService };







