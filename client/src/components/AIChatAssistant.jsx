import React, { useState, useEffect, useRef } from 'react';

// --- Icons and Loading (no changes) ---
const LoadingDots = () => (
  <div className="flex space-x-1 items-center">
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce animation-delay-200"></div>
    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce animation-delay-400"></div>
  </div>
);
const QuestionIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
// --- End Icons ---


// --- NEW: Component now receives all logic as props ---
const AIChatAssistant = ({ messages, isLoading, onSendMessage, mode, setMode }) => {
  const [input, setInput] = useState(''); // This state is still local
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // --- NEW: Submit handler now just calls the prop ---
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(input); // Send the local input state to the parent
    setInput(''); // Clear the local input
  };

  const getPlaceholder = () => {
    return mode === 'ask' ? 'Ask about DASH features...' : 'Type task to create (e.g., meeting tomorrow 10am)';
  }

  return (
    <div className="flex flex-col h-[500px] w-96 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Chat Header - now uses props for mode */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">DASH AI Assistant</h3>
        <div className="flex space-x-1 border border-gray-300 rounded-lg p-0.5">
            <button
                onClick={() => setMode('ask')}
                className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${mode === 'ask' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Ask a question"
            >
               <QuestionIcon /> Ask
            </button>
             <button
                onClick={() => setMode('create')}
                className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${mode === 'create' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Create task from text"
            >
                <PlusIcon /> Create
            </button>
        </div>
      </div>

      {/* Message Display Area - now uses messages prop */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-[85%] shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.text.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line || '\u00A0'}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {isLoading && ( <div className="flex justify-start"><div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800"><LoadingDots /></div></div> )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - uses local input state */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={getPlaceholder()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatAssistant;


