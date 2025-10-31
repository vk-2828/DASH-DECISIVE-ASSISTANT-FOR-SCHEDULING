const { generateText, generateStructuredText } = require('../services/aiService');
const Task = require('../models/taskModel');
const mongoose = require('mongoose');

// --- Helper Function to Extract JSON ---
const extractJson = (text) => {
    if (!text || typeof text !== 'string') {
        console.error("Invalid input to extractJson:", text);
        return null;
    }
    const match = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
    if (match) {
        const jsonString = match[1] || match[2];
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse extracted JSON string:", jsonString, e);
            return null;
        }
    }
    console.error("No JSON object pattern found in AI response:", text);
    return null;
};

// --- Feature 1: AI Help Assistant (Updated Context) ---
exports.askAboutDash = async (req, res) => {
    const { question } = req.body;
    const userId = req.user.id;
    if (!question) {
        return res.status(400).json({ message: 'Question is required.' });
    }
    const context = `
        You are a friendly and helpful assistant for the DASH (Decisive Assistant for Scheduling) task management app.
        Your goal is to answer user questions about how to use the app. Use simple, clear language and bullet points or numbered lists for steps.

        Key DASH Features:
        - Create tasks (title, description, due date/time).
        - Set task priority (0-100% slider).
        - Star important tasks.
        - Mark tasks as complete.
        - Add multiple reminders (including daily recurring ones).
        - View tasks in different lists (All, Starred, Completed, Trash).
        - View tasks on a Calendar page.
        - View reminder history on a Notifications page.
        - Manage profile (name, phone, password) and see stats on a Profile page.
        - Automatically moves overdue tasks to Trash.

        Answering Rules:
        1. Answer only questions related to using the DASH app features listed above.
        2. Keep your answers concise and easy to understand.
        3. If the question is unrelated, politely state you can only help with DASH features.
        4. **CRITICAL: DO NOT mention the developer's contact information (Vamshi Krishna, vamshikrishnadaripelli22@gmail.com) UNLESS the user explicitly asks "How can I contact the developer?" or "Who do I contact for more help?".**
    `;
    const prompt = `${context}\n\nUser Question: "${question}"\n\nAnswer:`;
    try {
        const answer = await generateText(prompt);
        // Basic cleanup of potential markdown list markers
        const cleanedAnswer = answer.replace(/^[*\-]\s/gm, '');
        res.json({ answer: cleanedAnswer });
    } catch (error) {
        console.error("Error getting answer from AI:", error);
        res.status(500).json({ message: 'Failed to get answer from AI assistant.' });
    }
};


// --- Feature 2: Natural Language Task Creation (Final Version) ---
exports.createTaskFromText = async (req, res) => {
    const { textInput } = req.body;
    const userId = req.user.id;

    if (!textInput) {
        return res.status(400).json({ message: 'Text input is required.' });
    }

    const taskSchema = {
        type: "OBJECT",
        properties: {
            title: { type: "STRING", description: "The main title or subject of the task." },
            description: { type: "STRING", description: "A MORE DETAILED description, if mentioned separately.", nullable: true },
            dueDate: { type: "STRING", description: "The due date AND specific time (if mentioned) in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Infer the year.", nullable: true },
            priority: { type: "NUMBER", description: "Suggested priority (0-100), default 50. Use 80-90 for 'important','urgent','asap'.", nullable: true },
            alarms: { type: "ARRAY", description: "Any specific reminder times mentioned (ISO 8601).", items: { type: "STRING" }, nullable: true },
            recurrence: { type: "STRING", description: "Is this a recurring task? If yes, specify frequency (e.g., 'daily', 'weekly').", nullable: true },
            isRecurrentDaily: { type: "BOOLEAN", description: "Set to true if recurrence is 'daily'", nullable: true }
        },
    };

    const prompt = `
        Analyze the following user input and extract task details based on the provided JSON schema.
        Today's date is ${new Date().toLocaleDateString('en-CA')}. Infer the current year if missing.
        Interpret relative dates/times accurately (e.g., 'tomorrow morning 10', 'next Friday at 2pm', 'evening', 'weekend').
        Convert extracted date AND time to ISO 8601 for dueDate. If no time is mentioned with a date, default time to 23:59:59.
        Set priority based on keywords (urgent, important=85), default 50.
        Check if the task is meant to recur daily and set recurrence field to 'daily' and isRecurrentDaily to true if so.
        Put the main subject of the task in the 'title' field if possible. If the main subject fits better as a short description, use the 'description' field instead and make the title concise.
        Return ONLY the JSON object, optionally wrapped in \`\`\`json markdown.

        User Input: "${textInput}"
    `;

    try {
        const rawResponse = await generateStructuredText(prompt, taskSchema);
        // console.log("Raw AI Response for Task Creation:", rawResponse); // Keep commented out unless debugging
        const taskDetails = extractJson(rawResponse);

        if (!taskDetails) {
            console.error("Failed to extract valid JSON from AI response:", rawResponse);
            return res.status(500).json({ message: 'AI returned an unexpected format. Could not extract task details.' });
        }

        // Flexible Title Extraction
        const extractedTitle = taskDetails.title || taskDetails.task_description || taskDetails.taskDescription || taskDetails.description;
        const extractedDescription = (taskDetails.title && extractedTitle === taskDetails.description) ? '' : taskDetails.description;

        if (!extractedTitle) {
            console.error("AI failed to extract any valid task title/subject/description from JSON:", taskDetails);
            throw new Error("AI failed to extract a valid task identifier.");
        }

        // Automatic Reminder and Recurrence Logic
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
            if (isDailyRecurrence && finalAlarms.length === 0 && validDueDate > now) {
                 finalAlarms.push({ time: validDueDate, repeatDaily: true });
            }
        }

        if (taskDetails.alarms && Array.isArray(taskDetails.alarms)) {
            taskDetails.alarms.forEach(a => {
                const alarmDate = new Date(a);
                if (!isNaN(alarmDate)) {
                    if (!finalAlarms.some(existing => existing.time.getTime() === alarmDate.getTime())) {
                         finalAlarms.push({ time: alarmDate, repeatDaily: isDailyRecurrence });
                    }
                }
            });
        }

        // Create the Task object
        const newTask = new Task({
            user: userId,
            title: extractedTitle,
            description: extractedDescription || '',
            priority: taskDetails.priority || 50,
            dueDate: validDueDate,
            alarms: finalAlarms,
            isStarred: false, isCompleted: false, isDeleted: false,
        });

        const savedTask = await newTask.save();
        res.status(201).json({ message: 'Task created successfully by AI!', task: savedTask });

    } catch (error) {
        console.error("Error creating task from text via AI:", error);
        res.status(500).json({ message: 'Failed to create task using AI. Check server logs for details.' });
    }
};





