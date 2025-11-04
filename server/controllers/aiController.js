const { generateText, generateStructuredText } = require('../services/aiService');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { sendEmail } = require('../services/emailService');
const mongoose = require('mongoose');

// --- Helper: Extracts JSON from AI response ---
const extractJson = (text) => {
    if (!text || typeof text !== 'string') { console.error("Invalid input to extractJson:", text); return null; }
    const match = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (match) {
        const jsonString = match[1] || match[2];
        try { return JSON.parse(jsonString); } catch (e) { console.error("Failed to parse extracted JSON string:", jsonString, e); return null; }
    }
    console.error("No JSON object pattern found in AI response:", text); return null;
};

// --- Helper: Sends creation email ---
const sendCreationEmail = async (userId, task) => {
    const user = await User.findById(userId);
    if (user) {
        let detailsHtml = '';
        const dateTimeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
        if (task.dueDate) { detailsHtml += `<br><b>🎯 Deadline:</b> ${new Date(task.dueDate).toLocaleString('en-US', dateTimeOptions)}`; }
        if (task.alarms && task.alarms.length > 0) {
            const nextAlarmTime = new Date(Math.min(...task.alarms.map(alarm => new Date(alarm.time))));
            detailsHtml += `<br><b>⏰ First Reminder:</b> ${nextAlarmTime.toLocaleString('en-US', dateTimeOptions)}`;
        }
        const emailSubject = `🚀 New Quest Added (by AI): ${task.title}`;
        const emailBody = `Hi ${user.name},<br><br>Your assistant has created a new task: "<strong>${task.title}</strong>". Details:${detailsHtml}<br><br>You've got this!`;
        await sendEmail(user.email, emailSubject, emailBody);
    }
};

// --- Helper: Generates alarms from a due date ---
const generateAlarmsAndDueDate = (taskDetails) => {
    let finalAlarms = [];
    let validDueDate = null;
    let isDailyRecurrence = (taskDetails.recurrence && taskDetails.recurrence.toLowerCase() === 'daily') || (taskDetails.isRecurrentDaily === true);
    if (taskDetails.dueDate && !isNaN(new Date(taskDetails.dueDate))) {
        validDueDate = new Date(taskDetails.dueDate);
        const dueDateMillis = validDueDate.getTime();
        const reminder10Min = new Date(dueDateMillis - 10 * 60 * 1000);
        const reminder5Min = new Date(dueDateMillis - 5 * 60 * 1000);
        const now = new Date();
        if (reminder10Min > now) finalAlarms.push({ time: reminder10Min, repeatDaily: isDailyRecurrence });
        if (reminder5Min > now) finalAlarms.push({ time: reminder5Min, repeatDaily: isDailyRecurrence });
        if (isDailyRecurrence && finalAlarms.length === 0 && validDueDate > now) { finalAlarms.push({ time: validDueDate, repeatDaily: true }); }
    }
    if (taskDetails.alarms && Array.isArray(taskDetails.alarms)) { taskDetails.alarms.forEach(a => { const alarmDate = new Date(a); if (!isNaN(alarmDate)) { if (!finalAlarms.some(existing => existing.time.getTime() === alarmDate.getTime())) { finalAlarms.push({ time: alarmDate, repeatDaily: isDailyRecurrence }); } } }); }
    return { finalAlarms, validDueDate, isDailyRecurrence };
};


// --- Feature 1: AI Help Assistant (IMPROVED CONTEXT) ---
exports.askAboutDash = async (req, res) => {
    const { question } = req.body;
    if (!question) { return res.status(400).json({ message: 'Question is required.' }); }

    const context = `
        You are DASH (Decisive Assistant for Scheduling), a helpful AI assistant for a task management app.
        Your goal is to answer user questions about how to use the app.

        RULES FOR YOUR RESPONSE:
        1.  **Use simple, clear language.**
        2.  **Use bullet points (-) or numbered lists (1., 2.) for steps or lists.**
        3.  **DO NOT use any Markdown formatting.** This means no asterisks (**) for bolding.
        4.  **Answer ONLY questions related to DASH features.** If asked something else (like politics or science), politely say, "I can only help with questions about the DASH app."
        5.  **CRITICAL PRIVACY RULE:** You MUST NOT provide the developer's contact info (Vamshi Krishna, vamshikrishnadaripelli22@gmail.com) UNLESS the user *specifically* asks "How do I contact the developer?" or "Who made this app?"

        DASH APP FEATURES:
        - Tasks: Create, edit, delete, complete, and star tasks.
        - Priority: Set task priority from 0-100%.
        - Reminders: Add multiple reminders, including daily recurring ones.
        - Views: "All Tasks", "Starred", "Completed", and "Trash" (with restore).
        - Calendar: A page to see all tasks on a calendar.
        - Profile Page: A page to update your profile and see a pie chart of your task stats.
        - Notifications: A page to see your reminder history.
        - Auto-Cleanup: Overdue tasks are moved to the trash automatically.
    `;
    const prompt = `${context}\n\nUser Question: "${question}"\n\nAnswer:`;
    try {
        const answer = await generateText(prompt);
        const cleanedAnswer = answer.replace(/^[*\-]\s/gm, '').trim(); 
        res.json({ answer: cleanedAnswer });
    } catch (error) {
        console.error("Error getting answer from AI:", error);
        res.status(500).json({ message: 'Failed to get answer from AI assistant.' });
    }
};

// --- Handler for CREATE Intent ---
async function handleCreateTask(userId, textInput) {
    const taskSchema = {
        type: "OBJECT",
        properties: {
            title: { type: "STRING" }, description: { type: "STRING", nullable: true },
            dueDate: { type: "STRING", description: "ISO 8601 format", nullable: true },
            priority: { type: "NUMBER", nullable: true },
            alarms: { type: "ARRAY", items: { type: "STRING" }, nullable: true },
            recurrence: { type: "STRING", nullable: true }, isRecurrentDaily: { type: "BOOLEAN", nullable: true }
        },
    };
    const prompt = `
        Analyze this user input to create a task. Extract title, description, dueDate (ISO 8601), priority (0-100), and recurrence ('daily').
        CRITICAL: The user is in 'Asia/Kolkata' (IST, UTC+5:30) timezone. All relative times ('tomorrow', '10pm') MUST be interpreted in this timezone.
        Today's date is ${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.
        Return ONLY the JSON object.
        User Input: "${textInput}"
    `;
    const rawResponse = await generateStructuredText(prompt, taskSchema);
    const taskDetails = extractJson(rawResponse);
    if (!taskDetails) { throw new Error('AI returned invalid JSON for task creation.'); }

    const extractedTitle = taskDetails.title || taskDetails.task_description || taskDetails.taskDescription || taskDetails.description;
    const extractedDescription = (taskDetails.title && extractedTitle === taskDetails.description) ? '' : taskDetails.description;
    if (!extractedTitle) { throw new Error("AI failed to extract a valid task identifier."); }

    let { finalAlarms, validDueDate } = generateAlarmsAndDueDate(taskDetails);
    const newTask = new Task({ user: userId, title: extractedTitle, description: extractedDescription || '', priority: taskDetails.priority || 50, dueDate: validDueDate, alarms: finalAlarms });
    const savedTask = await newTask.save();
    await sendCreationEmail(userId, savedTask);
    return { message: `Task created: "${savedTask.title}"`, task: savedTask };
}

// --- Handler for READ Intent ---
async function handleReadTasks(userId, textInput) {
    const userTasks = await Task.find({ user: userId, isDeleted: false, isCompleted: false }).select('title description priority dueDate');
    const taskListForAI = userTasks.map(t => ({ id: t._id, title: t.title, description: t.description, dueDate: t.dueDate }));
    
    const readPrompt = `
        You are a helpful assistant. The user wants to know about their tasks.
        User Input: "${textInput}"
        User's Current Task List: ${JSON.stringify(taskListForAI)}

        Based on the user's input, analyze their task list and provide a concise, natural language summary.
        If they ask for "tasks due today", filter the list for today.
        If they ask for "overdue tasks", filter for tasks with due dates in the past.
        Answer in simple language and use bullet points if listing more than one task. Do not use Markdown.
    `;
    const summary = await generateText(readPrompt);
    return { message: summary };
}

// --- Handler for UPDATE Intent ---
async function handleUpdateTask(userId, textInput) {
    const userTasks = await Task.find({ user: userId, isDeleted: false, isCompleted: false }).select('title _id');
    const updateSchema = {
        type: "OBJECT",
        properties: {
            task_id: { type: "STRING", description: "The specific 'id' from the provided task list that matches the user's query." },
            update_fields: {
                type: "OBJECT",
                description: "The specific fields to change and their new values.",
                properties: {
                    title: { type: "STRING", nullable: true },
                    description: { type: "STRING", nullable: true },
                    dueDate: { type: "STRING", description: "ISO 8601 format", nullable: true },
                    priority: { type: "NUMBER", nullable: true }
                },
            }
        },
        required: ["task_id", "update_fields"]
    };
    const updatePrompt = `
        Analyze the user's command to update a task.
        User Command: "${textInput}"
        User's Task List: ${JSON.stringify(userTasks)}
        CRITICAL: The user is in 'Asia/Kolkata' (IST, UTC+5:30) timezone. Interpret all relative times ('tomorrow', '10pm') in this timezone.
        Today's date is ${new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })}.

        Instructions:
        1. Find the task the user is referring to from their task list. Set its 'id' as 'task_id'.
        2. Determine what fields they want to change and what the new values are. Set these in 'update_fields'.
        3. Convert all new dates/times to ISO 8601 format.
        Return ONLY the JSON object.
    `;
    const rawResponse = await generateStructuredText(updatePrompt, updateSchema);
    const action = extractJson(rawResponse);
    if (!action || !action.task_id || !action.update_fields) { throw new Error('AI failed to extract update details.'); }
    
    const taskToUpdate = await Task.findOne({ _id: new mongoose.Types.ObjectId(action.task_id), user: userId });
    if (!taskToUpdate) { throw new Error("Task not found or user not authorized."); }

    Object.assign(taskToUpdate, action.update_fields);
    await taskToUpdate.save();
    return { message: `Task updated: "${taskToUpdate.title}"` };
}

// --- Handler for DELETE Intent ---
async function handleDeleteTask(userId, textInput) {
    const userTasks = await Task.find({ user: userId, isDeleted: false, isCompleted: false }).select('title _id');
    const deleteSchema = { type: "OBJECT", properties: { task_id: { type: "STRING", description: "The 'id' of the task to delete." } }, required: ["task_id"] };
    const deletePrompt = `
        Analyze the user's command to delete a task.
        User Command: "${textInput}"
        User's Task List: ${JSON.stringify(userTasks)}
        
        Instructions:
        1. Find the task the user wants to delete from their task list.
        2. Set its 'id' as 'task_id'.
        Return ONLY the JSON object.
    `;
    const rawResponse = await generateStructuredText(deletePrompt, deleteSchema);
    const action = extractJson(rawResponse);
    if (!action || !action.task_id) { throw new Error('AI failed to identify task to delete.'); }

    const taskToDelete = await Task.findOne({ _id: new mongoose.Types.ObjectId(action.task_id), user: userId });
    if (!taskToDelete) { throw new Error("Task not found or user not authorized."); }

    taskToDelete.isDeleted = true; // Soft delete
    await taskToDelete.save();
    return { message: `Task moved to trash: "${taskToDelete.title}"` };
}


// --- Feature 2: The "Super-Assistant" Command Processor ---
// This is the main router function that decides which helper to call.
exports.processAiCommand = async (req, res) => {
    const { textInput } = req.body;
    const userId = req.user.id;
    if (!textInput) { return res.status(400).json({ message: 'Text input is required.' }); }

    // --- 1. First Pass: Determine User Intent ---
    const intentSchema = { type: "OBJECT", properties: {
        intent: { type: "STRING", enum: ["CREATE", "READ", "UPDATE", "DELETE", "HELP"] },
    }, required: ["intent"]};
    const intentPrompt = `
        Analyze the user's text and determine their primary intent.
        - 'what', 'how', 'why', 'who', 'list features', 'help' -> HELP
        - 'what are my tasks', 'show me my tasks', 'summarize' -> READ
        - 'update', 'change', 'move', 'reschedule' -> UPDATE
        - 'delete', 'remove', 'trash' -> DELETE
        - 'create', 'add', 'remind me', 'new task' -> CREATE
        Return ONLY the JSON object.
        User Input: "${textInput}"
    `;

    try {
        const intentResponse = await generateStructuredText(intentPrompt, intentSchema);
        const intentDetails = extractJson(intentResponse);
        if (!intentDetails || !intentDetails.intent) { throw new Error('AI could not determine user intent.'); }

        // --- 2. Second Pass: Execute based on Intent ---
        let result;
        switch (intentDetails.intent) {
            case 'CREATE':
                result = await handleCreateTask(userId, textInput);
                return res.status(201).json(result);
            case 'READ':
                result = await handleReadTasks(userId, textInput);
                return res.json(result);
            case 'UPDATE':
                result = await handleUpdateTask(userId, textInput);
                return res.json(result);
            case 'DELETE':
                result = await handleDeleteTask(userId, textInput);
                return res.json(result);
            case 'HELP':
                // Pass the original request object (req) to the askAboutDash function
                return exports.askAboutDash(req, res);
            default:
                // If intent is UNKNOWN or anything else, pass to help
                return exports.askAboutDash(req, res);
        }
    } catch (error) {
        console.error("Error in processAiCommand:", error);
        res.status(500).json({ message: 'Failed to process AI command. Check server logs.' });
    }
};




// const { generateText, generateStructuredText } = require('../services/aiService');
// const Task = require('../models/taskModel');
// const User = require('../models/userModel');
// const { sendEmail } = require('../services/emailService');
// const mongoose = require('mongoose');

// // --- Helper Function to Extract JSON ---
// const extractJson = (text) => {
//     if (!text || typeof text !== 'string') {
//         console.error("Invalid input to extractJson:", text);
//         return null;
//     }
//     const match = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
//     if (match) {
//         const jsonString = match[1] || match[2];
//         try {
//             return JSON.parse(jsonString);
//         } catch (e) {
//             console.error("Failed to parse extracted JSON string:", jsonString, e);
//             return null;
//         }
//     }
//     console.error("No JSON object pattern found in AI response:", text);
//     return null;
// };

// // --- Feature 1: AI Help Assistant (Updated Context) ---
// exports.askAboutDash = async (req, res) => {
//     const { question } = req.body;
//     const userId = req.user.id;
//     if (!question) {
//         return res.status(400).json({ message: 'Question is required.' });
//     }
//     const context = `
//         You are a friendly and helpful assistant for the DASH (Decisive Assistant for Scheduling) task management app.
//         Your goal is to answer user questions about how to use the app. Use simple, clear language and bullet points or numbered lists for steps.

//         Key DASH Features:
//         - Create tasks (title, description, due date/time).
//         - Set task priority (0-100% slider).
//         - Star important tasks.
//         - Mark tasks as complete.
//         - Add multiple reminders (including daily recurring ones).
//         - View tasks in different lists (All, Starred, Completed, Trash).
//         - View tasks on a Calendar page.
//         - View reminder history on a Notifications page.
//         - Manage profile (name, phone, password) and see stats on a Profile page.
//         - Automatically moves overdue tasks to Trash.

//         Answering Rules:
//         1. Answer only questions related to using the DASH app features listed above.
//         2. Keep your answers concise and easy to understand.
//         3. If the question is unrelated, politely state you can only help with DASH features.
//         4. **CRITICAL: DO NOT mention the developer's contact information (Vamshi Krishna, vamshikrishnadaripelli22@gmail.com) UNLESS the user explicitly asks "How can I contact the developer?" or "Who do I contact for help?".**
//     `;
//     const prompt = `${context}\n\nUser Question: "${question}"\n\nAnswer:`;
//     try {
//         const answer = await generateText(prompt);
//         const cleanedAnswer = answer.replace(/^[*\-]\s/gm, '').trim(); 
//         res.json({ answer: cleanedAnswer });
//     } catch (error) {
//         console.error("Error getting answer from AI:", error);
//         res.status(500).json({ message: 'Failed to get answer from AI assistant.' });
//     }
// };


// // --- Feature 2: Natural Language Task Creation (Final Version) ---
// exports.createTaskFromText = async (req, res) => {
//     const { textInput } = req.body;
//     const userId = req.user.id;

//     if (!textInput) {
//         return res.status(400).json({ message: 'Text input is required.' });
//     }

//     const taskSchema = {
//         type: "OBJECT",
//         properties: {
//             title: { type: "STRING", description: "The main title or subject of the task." },
//             description: { type: "STRING", description: "A MORE DETAILED description, if mentioned separately.", nullable: true },
//             dueDate: { type: "STRING", description: "The due date AND specific time (if mentioned) in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Infer the year.", nullable: true },
//             priority: { type: "NUMBER", description: "Suggested priority (0-100), default 50. Use 80-90 for 'important','urgent','asap'.", nullable: true },
//             alarms: { type: "ARRAY", description: "Any specific reminder times mentioned (ISO 8601).", items: { type: "STRING" }, nullable: true },
//             recurrence: { type: "STRING", description: "Is this a recurring task? If yes, specify frequency (e.g., 'daily', 'weekly').", nullable: true },
//             isRecurrentDaily: { type: "BOOLEAN", description: "Set to true if recurrence is 'daily'", nullable: true }
//         },
//     };

//     const prompt = `
//         Analyze the following user input and extract task details based on the provided JSON schema.
//         Today's date is ${new Date().toLocaleDateString('en-CA')}. Infer the current year if missing.
//         Interpret relative dates/times accurately (e.g., 'tomorrow morning 10', 'next Friday at 2pm', 'evening', 'weekend').
//         Convert extracted date AND time to ISO 8601 for dueDate. If no time is mentioned with a date, default time to 23:59:59.
//         Set priority based on keywords (urgent, important=85), default 50.
//         Check if the task is meant to recur daily and set recurrence field to 'daily' and isRecurrentDaily to true if so.
//         Put the main subject of the task in the 'title' field if possible. If the main subject fits better as a short description, use the 'description' field instead and make the title concise.
//         Return ONLY the JSON object, optionally wrapped in \`\`\`json markdown.

//         User Input: "${textInput}"
//     `;

//     try {
//         const rawResponse = await generateStructuredText(prompt, taskSchema);
//         // console.log("Raw AI Response for Task Creation:", rawResponse);
//         const taskDetails = extractJson(rawResponse);

//         if (!taskDetails) {
//             console.error("Failed to extract valid JSON from AI response:", rawResponse);
//             return res.status(500).json({ message: 'AI returned an unexpected format. Could not extract task details.' });
//         }

//         const extractedTitle = taskDetails.title || taskDetails.task_description || taskDetails.taskDescription || taskDetails.description;
//         const extractedDescription = (taskDetails.title && extractedTitle === taskDetails.description) ? '' : taskDetails.description;

//         if (!extractedTitle) {
//             console.error("AI failed to extract any valid task title/subject/description from JSON:", taskDetails);
//             throw new Error("AI failed to extract a valid task identifier.");
//         }

//         let finalAlarms = [];
//         let validDueDate = null;
//         let isDailyRecurrence = (taskDetails.recurrence && taskDetails.recurrence.toLowerCase() === 'daily') || (taskDetails.isRecurrentDaily === true);

//         if (taskDetails.dueDate && !isNaN(new Date(taskDetails.dueDate))) {
//             validDueDate = new Date(taskDetails.dueDate);
//             const dueDateMillis = validDueDate.getTime();
//             const reminder10Min = new Date(dueDateMillis - 10 * 60 * 1000);
//             const reminder5Min = new Date(dueDateMillis - 5 * 60 * 1000);
//             const now = new Date();
//             if (reminder10Min > now) finalAlarms.push({ time: reminder10Min, repeatDaily: isDailyRecurrence });
//             if (reminder5Min > now) finalAlarms.push({ time: reminder5Min, repeatDaily: isDailyRecurrence });
//             if (isDailyRecurrence && finalAlarms.length === 0 && validDueDate > now) {
//                  finalAlarms.push({ time: validDueDate, repeatDaily: true });
//             }
//         }

//         if (taskDetails.alarms && Array.isArray(taskDetails.alarms)) {
//             taskDetails.alarms.forEach(a => {
//                 const alarmDate = new Date(a);
//                 if (!isNaN(alarmDate)) {
//                     if (!finalAlarms.some(existing => existing.time.getTime() === alarmDate.getTime())) {
//                          finalAlarms.push({ time: alarmDate, repeatDaily: isDailyRecurrence });
//                     }
//                 }
//             });
//         }

//         const newTask = new Task({
//             user: userId,
//             title: extractedTitle,
//             description: extractedDescription || '',
//             priority: taskDetails.priority || 50,
//             dueDate: validDueDate,
//             alarms: finalAlarms,
//             isStarred: false, isCompleted: false, isDeleted: false,
//         });

//         const savedTask = await newTask.save();

//         const user = await User.findById(userId);
//         if (user) {
//             let detailsHtml = '';
//             const dateTimeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
//             if (savedTask.dueDate) {
//                 detailsHtml += `<br><b>🎯 Deadline:</b> ${new Date(savedTask.dueDate).toLocaleString('en-US', dateTimeOptions)}`;
//             }
//             if (savedTask.alarms && savedTask.alarms.length > 0) {
//                 const nextAlarmTime = new Date(Math.min(...savedTask.alarms.map(alarm => new Date(alarm.time))));
//                 detailsHtml += `<br><b>⏰ First Reminder:</b> ${nextAlarmTime.toLocaleString('en-US', dateTimeOptions)}`;
//             }
//             const emailSubject = `🚀 New Quest Added (by AI): ${savedTask.title}`;
//             const emailBody = `Hi ${user.name},<br><br>Your assistant has created a new task for you: "<strong>${savedTask.title}</strong>". Here are the details:${detailsHtml}<br><br>You've got this!`;
//             await sendEmail(user.email, emailSubject, emailBody);
//         }

//         res.status(201).json({ message: 'Task created successfully by AI!', task: savedTask });

//     } catch (error) {
//         console.error("Error creating task from text via AI:", error);
//         res.status(500).json({ message: 'Failed to create task using AI. Check server logs for details.' });
//     }
// };

// // --- NO MORE CODE AFTER THIS LINE ---






