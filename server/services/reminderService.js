const cron = require('node-cron');
const Task = require('../models/taskModel');
const Notification = require('../models/notificationModel');
const { sendEmail } = require('./emailService');
const { sendSms } = require('./smsService');

// --- NEW: The Cleanup Function ---
const cleanupOverdueTasks = async () => {
    const now = new Date();
    try {
        // Find all tasks that are not deleted and have a due date in the past.
        const overdueTasks = await Task.find({
            isDeleted: false,
            dueDate: { $lt: now } // $lt means "less than"
        });

        if (overdueTasks.length > 0) {
            console.log(`Found ${overdueTasks.length} overdue tasks to move to trash.`);
            // Create an array of IDs from the overdue tasks
            const idsToMove = overdueTasks.map(task => task._id);
            
            // Perform a single, efficient database operation to update all matched tasks
            await Task.updateMany(
                { _id: { $in: idsToMove } }, // Match all tasks with these IDs
                { $set: { isDeleted: true } } // Set their 'isDeleted' status to true
            );

            // Optional: You could create a notification for the user here
            // For example: await Notification.create({ user: userId, message: `${overdueTasks.length} tasks were moved to trash.` });
        }
    } catch (error) {
        console.error('Error during overdue task cleanup:', error);
    }
};


const startReminderService = () => {
    console.log('Advanced reminder and cleanup service scheduled to run every minute.');
    
    // This is the main cron job that runs every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        console.log(`[${now.toLocaleTimeString()}] Running service checks...`);

        // --- Execute BOTH functions every minute ---
        await handleReminders(now, currentHour, currentMinute);
        await cleanupOverdueTasks();
    });
};

// We've moved the reminder logic into its own async function for clarity
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








// const cron = require('node-cron');
// const Task = require('../models/taskModel');
// const Notification = require('../models/notificationModel'); // Import the new model
// const { sendEmail } = require('./emailService');
// const { sendSms } = require('./smsService');

// const startReminderService = () => {
//     console.log('Advanced reminder service with notification logging scheduled.');
//     cron.schedule('* * * * *', async () => {
//         const now = new Date();
//         const currentHour = now.getHours();
//         const currentMinute = now.getMinutes();
//         console.log(`[${now.toLocaleTimeString()}] Running advanced reminder check...`);

//         try {
//             // Logic for finding tasks (this part is unchanged)
//             const oneTimeTasks = await Task.find({
//                 isCompleted: false, isDeleted: false, 'alarms.repeatDaily': false,
//                 'alarms.time': { $gte: now, $lt: new Date(now.getTime() + 60 * 1000) }
//             }).populate('user');

//             const dailyTasks = await Task.find({
//                 isCompleted: false, isDeleted: false, 'alarms.repeatDaily': true,
//             }).populate('user');

//             const allTasksToRemind = [...oneTimeTasks];
//             dailyTasks.forEach(dailyTask => {
//                 const shouldRemind = dailyTask.alarms.some(alarm => 
//                     alarm.repeatDaily &&
//                     new Date(alarm.time).getHours() === currentHour &&
//                     new Date(alarm.time).getMinutes() === currentMinute
//                 );
//                 if (shouldRemind && !allTasksToRemind.find(t => t._id.equals(dailyTask._id))) {
//                     allTasksToRemind.push(dailyTask);
//                 }
//             });

//             if (allTasksToRemind.length > 0) {
//                 console.log(`Found ${allTasksToRemind.length} tasks with reminders.`);
//                 for (const task of allTasksToRemind) {
//                     if (task.user) {
//                         const reminderMessage = `Reminder for your task: "${task.title}".`;
                        
//                         // --- THIS IS THE NEW LOGIC ---
//                         // 1. Create the notification record in the database FIRST.
//                         await Notification.create({
//                             user: task.user._id,
//                             message: reminderMessage,
//                         });

//                         // 2. Then, send the actual email/SMS notifications.
//                         const emailSubject = `🔔 Quick Reminder: ${task.title}`;
//                         const smsBody = `DASH Reminder: Time to focus on "${task.title}". You can do it!`;
//                         await sendEmail(task.user.email, emailSubject, `Hi ${task.user.name}, ${reminderMessage}`);
//                         // await sendSms(task.user.phoneNumber, smsBody);
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error running reminder service:', error);
//         }
//     });
// };

// module.exports = { startReminderService };