import React from 'react';
import type { Mode } from '../types';

interface BottomNavProps {
    currentMode: Mode;
    onModeChange: (mode: Mode) => void;
}

const NavButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-full transition-all duration-300 transform ${isActive ? 'text-youtube-red' : 'text-youtube-gray hover:text-youtube-white'}`}
    >
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentMode, onModeChange }) => {
    return (
        <nav className="w-full bg-youtube-dark p-2 mt-auto shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-start h-16">
                <NavButton
                    icon="🎨"
                    label="Criar"
                    isActive={currentMode === 'create'}
                    onClick={() => onModeChange('create')}
                />
                <NavButton
                    icon="✏️"
                    label="Editar"
                    isActive={currentMode === 'edit'}
                    onClick={() => onModeChange('edit')}
                />
                <NavButton
                    icon="🎥"
                    label="Vídeo"
                    isActive={currentMode === 'video'}
                    onClick={() => onModeChange('video')}
                />
            </div>
        </nav>
    );
};

export default BottomNav;
