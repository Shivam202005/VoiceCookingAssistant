// src/components/VoiceModal.jsx
import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function VoiceModal({ isOpen, onClose, onVoiceResult }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Start listening when modal opens
  useEffect(() => {
    if (isOpen && browserSupportsSpeechRecognition) {
      resetTranscript();
      startListening();
    }
    return () => {
      if (listening) {
        SpeechRecognition.stopListening();
      }
    };
  }, [isOpen, resetTranscript, listening, browserSupportsSpeechRecognition]);

  // Auto-close and send results when user stops speaking
  useEffect(() => {
    let timeout;
    if (transcript && !listening && isOpen) {
      timeout = setTimeout(() => {
        handleVoiceComplete();
      }, 1500); // Wait 1.5 seconds after user stops speaking
    }
    return () => clearTimeout(timeout);
  }, [transcript, listening, isOpen]);

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleVoiceComplete = () => {
    if (transcript.trim()) {
      onVoiceResult(transcript.trim());
    }
    stopListening();
    onClose();
  };

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleClose = () => {
    stopListening();
    resetTranscript();
    onClose();
  };

  if (!isOpen) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
          <h3 className="text-xl font-bold mb-4 text-red-600">Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Your browser doesn't support speech recognition. Please use Chrome or Edge.
          </p>
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Search</h2>
          <p className="text-gray-500">
            {listening ? "Listening..." : "Click the mic to start"}
          </p>
        </div>

        {/* Mic Button */}
        <div className="mb-8">
          <button
            onClick={handleMicClick}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-300 transform hover:scale-105 ${
              listening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-orange-500 hover:bg-orange-600'
            } shadow-lg`}
          >
            {listening ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h4v12H6V6zm8 0h4v12h-4V6z"/>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2zm6.5 6H17c0 2.76-2.24 5-5 5s-5-2.24-5-5H5.5c0 3.53 2.61 6.43 6 6.92V21h2v-6.08c3.39-.49 6-3.39 6-6.92z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Live Transcription */}
        <div className="mb-8 min-h-[60px]">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
            {transcript ? (
              <p className="text-gray-800 font-medium">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">Your speech will appear here...</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVoiceComplete}
            disabled={!transcript.trim()}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              transcript.trim()
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
