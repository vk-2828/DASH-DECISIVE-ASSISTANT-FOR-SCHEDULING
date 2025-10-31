import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import FloatingAIChatButton from './FloatingAIChatButton';
import AIChatAssistant from './AIChatAssistant';
import useTasks from '../hooks/useTasks'; // Need for refetch
import aiService from '../api/aiService'; // Need for AI calls
import { toast } from 'react-toastify';

const DashboardLayout = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // --- NEW: Chat state is now managed here ---
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! Ask me about DASH or type a task to create.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('ask'); // 'ask' or 'create'
  const { refetchTasks } = useTasks();

  const handleSendMessage = async (input) => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]); // Add user message
    setIsLoading(true);

    try {
      let aiResponseText = '';
      if (mode === 'ask') {
        const response = await aiService.askAI(userMessage.text);
        aiResponseText = response.answer;
      } else {
        const response = await aiService.createTaskFromText(userMessage.text);
        aiResponseText = response.message || 'Task created successfully!';
        await refetchTasks();
      }
      const aiMessage = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Sorry, I couldn't ${mode === 'ask' ? 'answer' : 'create the task'}.`;
      toast.error(errorMessage);
      setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Button (no change in logic) */}
      <FloatingAIChatButton 
        isOpen={isChatOpen} 
        onClick={() => setIsChatOpen(!isChatOpen)} 
      />

      {/* The Chat Window is now passed all its logic as props */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-40"> 
          <AIChatAssistant
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            mode={mode}
            setMode={setMode}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;







