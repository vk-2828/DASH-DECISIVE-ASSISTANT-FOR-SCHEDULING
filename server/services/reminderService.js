const cron = require('node-cron');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { sendEmail } = require('./emailService');
const { generateText } = require('../services/aiService'); // Make sure aiService is imported

// --- Helper Function 1: Permanent Deletion ---
const purgeOldTasks = async () => {
    try {
        const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        const tasksToDelete = await Task.find({
            isDeleted: true,
            dueDate: { $lt: oneWeekAgo } 
        });

        if (tasksToDelete.length > 0) {
            console.log(`Found ${tasksToDelete.length} old tasks to purge permanently.`);
            const idsToDelete = tasksToDelete.map(task => task._id);
            await Task.deleteMany({ _id: { $in: idsToDelete } });
        }
    } catch (error) {
        console.error('Error during old task purge:', error);
    }
};

// --- Helper Function 2: Move Overdue to Trash ---
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

// --- Helper Function 3: Handle Reminders ---
const handleReminders = async (now) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
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

// --- Helper Function 4: AI Daily Briefing ---
const sendDailyBriefing = async () => {
    try {
        const allUsers = await User.find({ isEmailVerified: true });

        for (const user of allUsers) {
            const now = new Date();
            const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
            const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
            const endOfWeek = new Date(new Date().setDate(new Date().getDate() + 7));
            
            const allPendingTasks = await Task.find({
                user: user._id,
                isCompleted: false,
                isDeleted: false,
            }).sort({ dueDate: 1 });

            const dueToday = allPendingTasks.filter(t => t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday);
            const dueThisWeek = allPendingTasks.filter(t => t.dueDate && new Date(t.dueDate) > endOfToday && new Date(t.dueDate) <= endOfWeek);

            if (dueToday.length === 0 && dueThisWeek.length === 0) {
                console.log(`No pressing tasks for ${user.email}. Skipping daily briefing.`);
                continue; 
            }

            let taskListString = "--- TASKS DUE TODAY ---\n";
            dueToday.forEach(t => taskListString += `- ${t.title} (Priority: ${t.priority}%)\n`);
            taskListString += "\n--- TASKS DUE THIS WEEK ---\n";
            dueThisWeek.forEach(t => taskListString += `- ${t.title} (Priority: ${t.priority}%)\n`);
            
            const prompt = `
                You are DASH, a friendly AI assistant.
                The user, ${user.name}, has the following tasks due today and this week.
                Your job is to provide a brief, motivational summary and suggest a simple plan of action.
                - Be positive and encouraging.
                - Identify the 1-2 most important tasks (e.g., highest priority or due first).
                - Keep the entire summary under 100 words.
                - Format the output clearly. Do not use Markdown.

                Task List:
                ${taskListString}

                Your Summary:
            `;

            const aiSummary = await generateText(prompt);

            const emailSubject = `🚀 Your Daily Briefing for ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`;
            const emailBody = `
                Hi ${user.name},<br><br>
                Here's a look at your day ahead, powered by your DASH assistant:
                <br><br>
                <div style="background-color: #f4f4f4; border-left: 4px solid #3B82F6; padding: 16px;">
                    <p style="margin: 0;">${aiSummary.replace(/\n/g, '<br>')}</p>
                </div>
                <br>
                You've got this!
            `;
            await sendEmail(user.email, emailSubject, emailBody);
            console.log(`Sent daily briefing to ${user.email}`);
        }
    } catch (error) {
        console.error('Error sending daily AI briefings:', error);
    }
};


// --- Main Service Starter ---
const startReminderService = () => {
    console.log('Advanced reminder and cleanup service scheduled.');

    // 1. Run reminder check, cleanup, and purge every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        console.log(`[${now.toLocaleTimeString()}] Running minute-by-minute checks...`);
        await handleReminders(now);
        await cleanupOverdueTasks();
        await purgeOldTasks();
    });

    // 2. Run the "AI Daily Briefing" every day at 6:40 AM
    cron.schedule('40 6 * * *', async () => {
        console.log("--- Running 6:40 AM AI Daily Briefing ---");
        await sendDailyBriefing();
    }, {
        timezone: "Asia/Kolkata"
    });
};

// --- Export the function that starts the service ---
module.exports = { startReminderService };

// --- NO DUPLICATE CODE BELOW THIS LINE ---







// const cron = require('node-cron');
// const Task = require('../models/taskModel');
// const Notification = require('../models/notificationModel');
// const { sendEmail } = require('./emailService');

// // --- NEW: Function to permanently purge old tasks from the trash ---
// const purgeOldTasks = async () => {
//     try {
//         // Calculate the date 7 days ago
//         const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

//         // Find tasks that are:
//         // 1. In the trash (isDeleted: true)
//         // 2. Their due date passed more than 7 days ago
//         const tasksToDelete = await Task.find({
//             isDeleted: true,
//             dueDate: { $lt: oneWeekAgo } // $lt means "less than"
//         });

//         if (tasksToDelete.length > 0) {
//             console.log(`Found ${tasksToDelete.length} old tasks to purge permanently.`);
//             const idsToDelete = tasksToDelete.map(task => task._id);
            
//             // Perform a single, efficient operation to delete all matched tasks
//             await Task.deleteMany({ _id: { $in: idsToDelete } });
//         }
//     } catch (error) {
//         console.error('Error during old task purge:', error);
//     }
// };

// // --- This is the existing function to move overdue tasks to trash ---
// const cleanupOverdueTasks = async () => {
//     const now = new Date();
//     try {
//         const overdueTasks = await Task.find({
//             isDeleted: false,
//             dueDate: { $lt: now } 
//         });

//         if (overdueTasks.length > 0) {
//             console.log(`Found ${overdueTasks.length} overdue tasks to move to trash.`);
//             const idsToMove = overdueTasks.map(task => task._id);
//             await Task.updateMany(
//                 { _id: { $in: idsToMove } },
//                 { $set: { isDeleted: true } } 
//             );
//         }
//     } catch (error) {
//         console.error('Error during overdue task cleanup:', error);
//     }
// };

// const startReminderService = () => {
//     console.log('Advanced reminder and cleanup service scheduled to run every minute.');
    
//     cron.schedule('* * * * *', async () => {
//         const now = new Date();
//         const currentHour = now.getHours();
//         const currentMinute = now.getMinutes();
//         console.log(`[${now.toLocaleTimeString()}] Running service checks...`);

//         // --- Execute ALL THREE functions every minute ---
//         await handleReminders(now, currentHour, currentMinute);
//         await cleanupOverdueTasks();
//         await purgeOldTasks(); // NEW function is called here
//     });
// };

// // The function to handle sending reminders (no changes)
// const handleReminders = async (now, currentHour, currentMinute) => {
//     try {
//         // Find one-time tasks
//         const oneTimeTasks = await Task.find({
//             isCompleted: false, isDeleted: false, 'alarms.repeatDaily': false,
//             'alarms.time': { $gte: now, $lt: new Date(now.getTime() + 60 * 1000) }
//         }).populate('user');

//         // Find daily tasks
//         const dailyTasks = await Task.find({
//             isCompleted: false, isDeleted: false, 'alarms.repeatDaily': true,
//         }).populate('user');

//         const allTasksToRemind = [...oneTimeTasks];
//         dailyTasks.forEach(dailyTask => {
//             const shouldRemind = dailyTask.alarms.some(alarm => 
//                 alarm.repeatDaily &&
//                 new Date(alarm.time).getHours() === currentHour &&
//                 new Date(alarm.time).getMinutes() === currentMinute
//             );
//             if (shouldRemind && !allTasksToRemind.find(t => t._id.equals(dailyTask._id))) {
//                 allTasksToRemind.push(dailyTask);
//             }
//         });

//         if (allTasksToRemind.length > 0) {
//             console.log(`Found ${allTasksToRemind.length} tasks with reminders.`);
//             for (const task of allTasksToRemind) {
//                 if (task.user) {
//                     const reminderMessage = `Reminder for your task: "${task.title}".`;
//                     await Notification.create({ user: task.user._id, message: reminderMessage });
//                     await sendEmail(task.user.email, `🔔 Quick Reminder: ${task.title}`, `Hi ${task.user.name}, ${reminderMessage}`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('Error handling reminders:', error);
//     }
// };

// module.exports = { startReminderService };







