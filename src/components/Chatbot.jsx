import { API_URL } from "../lib/api";
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Paperclip, Image as ImageIcon, FileText, Loader2, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export default function Chatbot() {
  const { user, token } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  // Browser voice input using the Web Speech API.
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (transcript.trim()) {
        setMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Voice input error:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone permission was denied. Please allow microphone access and try again.');
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert(
        'Unsupported file type. Please upload an image, PDF, TXT, CSV, DOCX or XLSX file.'
      );

      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum allowed size is 50 MB.');

      event.target.value = '';
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    event.target.value = '';
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-primary" />;
    }

    return <FileText className="h-5 w-5 text-primary" />;
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if ((!trimmedMessage && !selectedFile) || loading) {
      return;
    }

    setLoading(true);

    const currentMessage = trimmedMessage;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: currentMessage || 'Please analyze this attachment.',
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            previewUrl
          }
        : null
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const formData = new FormData();

      formData.append('message', currentMessage);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const history = messages.map((item) => ({
        role: item.role,
        content: item.content
      }));

      formData.append('history', JSON.stringify(history));

      const response = await fetch(`${API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chatbot response.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.answer || data.reply || data.message || 'No response received.'
        }
      ]);

      setMessage('');
      removeSelectedFile();
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            error.message ||
            'Sorry, I could not process your request right now.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Chatbot floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
          aria-label="Open LMS Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chatbot window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-48px)] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <div className="font-semibold text-sm">
                  LMS LMS Assistant
                </div>

                <div className="text-xs opacity-80">
                  How can I help you?
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/10"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/30">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-10">
                <Bot className="h-10 w-10 mx-auto mb-3 text-primary opacity-70" />

                <p className="font-medium text-gray-700 dark:text-gray-300">
                  LMS LMS Assistant
                </p>

                <p className="mt-1">
                  Ask me about courses, modules, assessments, progress,
                  certificates and more.
                </p>

                <p className="mt-3 text-xs">
                  You can also attach a file or image.
                </p>
              </div>
            )}

            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex gap-2 ${
                  item.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {item.role === 'assistant' && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
                    item.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 border border-border text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {/* Attachment */}
                  {item.attachment && (
                    <div className="mb-2">
                      {item.attachment.previewUrl ? (
                        <img
                          src={item.attachment.previewUrl}
                          alt={item.attachment.name}
                          className="max-w-full max-h-40 rounded-md object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-2 rounded-md bg-black/5 dark:bg-white/5 px-2 py-2">
                          <FileText className="h-5 w-5 shrink-0" />

                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium">
                              {item.attachment.name}
                            </div>

                            <div className="text-[10px] opacity-70">
                              {formatFileSize(item.attachment.size)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap break-words">
                    {item.content}
                  </div>
                </div>

                {item.role === 'user' && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>

                <div className="bg-white dark:bg-gray-800 border border-border rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Selected attachment preview */}
          {selectedFile && (
            <div className="border-t border-border px-3 py-2 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={selectedFile.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    {getFileIcon()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 bg-white dark:bg-gray-800">
            <div className="flex items-end gap-2">

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="h-10 w-10 shrink-0 rounded-md border border-border flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                aria-label="Attach file or image"
                title="Attach file or image"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Voice input */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`h-10 w-10 shrink-0 rounded-md border border-border flex items-center justify-center transition ${
                  isListening
                    ? 'bg-red-500 text-white border-red-500 animate-pulse'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                } disabled:opacity-50`}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                title={isListening ? 'Stop voice input' : 'Speak your message'}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              {/* Message input */}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your LMS..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />

              {/* Send */}
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || (!message.trim() && !selectedFile)}
                className="h-10 w-10 shrink-0 rounded-md bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="text-[10px] text-gray-400 mt-1.5 text-center">
              {isListening ? 'Listening... speak now' : 'Max file size: 50 MB'}
            </div>
          </div>
        </div>
      )}
   
    </>
  );
}