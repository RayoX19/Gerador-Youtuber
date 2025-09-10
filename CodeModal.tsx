import React, { useState, useEffect } from 'react';
import playSound from '../services/audioService';

interface CodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CORRECT_CODE = "47534420";

const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setCode('');
            setError('');
        }
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    const handleClose = () => {
        playSound('click');
        onClose();
    };
    
    const handleSubmit = () => {
        playSound('click');
        if (code === CORRECT_CODE) {
            onSuccess();
        } else {
            playSound('error');
            setError('Código incorreto. Tente novamente.');
            setCode('');
        }
    };
    
    if (!shouldRender) return null;
    const animationClass = isOpen ? 'animate-fadeIn' : 'animate-fadeOut';

    return (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 ${animationClass}`} onAnimationEnd={onAnimationEnd}>
            <div className="bg-youtube-dark p-6 rounded-lg shadow-xl text-white w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Acesso Restrito 🔞</h2>
                <p className="text-youtube-gray mb-4 text-sm">Insira o código de acesso para desbloquear o modo de criação de conteúdo adulto.</p>
                <input 
                    type="password" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full bg-youtube-black border border-youtube-gray/50 rounded p-2 mb-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-youtube-red"
                    placeholder="****"
                    autoFocus
                />
                {error && <p className="text-youtube-red/80 text-sm mb-4">{error}</p>}
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={handleClose} className="py-2 px-4 rounded bg-youtube-gray/50 hover:bg-youtube-gray/80 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="py-2 px-4 rounded bg-youtube-red hover:bg-opacity-80 transition-colors font-semibold">Desbloquear</button>
                </div>
            </div>
        </div>
    );
};

export default CodeModal;
