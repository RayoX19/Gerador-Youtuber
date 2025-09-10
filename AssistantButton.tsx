import React from 'react';
import playSound from '../services/audioService';

interface AssistantButtonProps {
    onClick: () => void;
}

const AssistantButton: React.FC<AssistantButtonProps> = ({ onClick }) => {
    
    const handleClick = () => {
        playSound('open');
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-br from-youtube-red to-red-800 rounded-full shadow-2xl z-40 flex items-center justify-center text-white transform transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-400"
            aria-label="Abrir Assistente de IA"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10c5.515 0 10-4.486 10-10S17.515 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                <path d="M12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z"></path>
                <path d="M12 9c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z"></path>
            </svg>
        </button>
    );
};

export default AssistantButton;
