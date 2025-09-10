import React, { useRef, useState, useEffect } from 'react';
import type { Mode, CreateFunction, EditFunction, UploadedImage, AspectRatio } from '../types';
import playSound from '../services/audioService';

interface ControlsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    mode: Mode;
    createFunction: CreateFunction;
    setCreateFunction: (func: CreateFunction) => void;
    editFunction: EditFunction;
    setEditFunction: (func: EditFunction) => void;
    image1: UploadedImage | null;
    image2: UploadedImage | null;
    referenceImage: UploadedImage | null;
    handleImageUpload: (file: File, imageSlot: 1 | 2 | 'single' | 'reference') => void;
    generateContent: () => void;
    isLoading: boolean;
    variationCount: number;
    setVariationCount: (count: number) => void;
    isAdultModeUnlocked: boolean;
    onLockClick: () => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    clearUploads: () => void;
}

const FunctionCard: React.FC<{
    icon: string; name: string; isActive: boolean; onClick: () => void; isLocked?: boolean;
}> = ({ icon, name, isActive, onClick, isLocked = false }) => (
    <div
        className={`p-2 rounded-lg text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center aspect-square ${isActive ? 'bg-youtube-red scale-105 shadow-lg' : 'bg-youtube-dark hover:bg-gray-700'}`}
        onClick={onClick}
    >
        <div className="text-2xl mb-1 relative">
            {icon}
            {isLocked && <span className="absolute -top-1 -right-2 text-xs">🔒</span>}
        </div>
        <div className="font-semibold text-[10px]">{name}</div>
    </div>
);

const UploadArea: React.FC<{ id: string; onUpload: (file: File) => void; previewUrl: string | null; text: string; }> = ({ id, onUpload, previewUrl, text }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => (e.target.files && e.target.files[0]) && onUpload(e.target.files[0]);

    return (
        <div 
            className="w-full h-24 border-2 border-dashed border-youtube-gray/50 rounded-lg text-center cursor-pointer hover:border-youtube-red transition-colors duration-300 bg-youtube-black relative overflow-hidden flex flex-col items-center justify-center"
            onClick={() => inputRef.current?.click()}
        >
            <input type="file" id={id} ref={inputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <>
                    <div className="text-2xl text-youtube-gray">📁</div>
                    <p className="font-semibold text-xs mt-1">{text}</p>
                </>
            )}
        </div>
    );
};

const AspectRatioSelector: React.FC<{ value: AspectRatio, onChange: (value: AspectRatio) => void }> = ({ value, onChange }) => {
    const ratios: { name: string, value: AspectRatio, icon: string }[] = [
        { name: 'Paisagem', value: '16:9', icon: '▬' },
        { name: 'Retrato', value: '9:16', icon: '▮' },
        { name: 'Quadrado', value: '1:1', icon: '■' },
    ];
    return (
        <div className="w-full">
            <div className="text-sm font-semibold mb-2 text-youtube-gray">Proporção</div>
            <div className="grid grid-cols-3 gap-2">
                {ratios.map(ratio => (
                    <button 
                        key={ratio.value} 
                        onClick={() => { playSound('click'); onChange(ratio.value); }}
                        title={ratio.name}
                        className={`p-2 rounded-md flex flex-col items-center justify-center transition-colors duration-200 ${value === ratio.value ? 'bg-youtube-red font-semibold' : 'bg-youtube-dark hover:bg-gray-700'}`}
                    >
                        <span className="text-lg">{ratio.icon}</span>
                        <span className="text-[10px] mt-1">{ratio.value}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ControlsDrawer: React.FC<ControlsDrawerProps> = (props) => {
    const { isOpen, onClose, prompt, setPrompt, mode, aspectRatio, setAspectRatio, generateContent, isLoading } = props;
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [showTwoImages, setShowTwoImages] = useState(false);

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const onAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };
    
    const handleClose = () => {
        playSound('click');
        onClose();
    };

    const handleCreateFuncClick = (func: CreateFunction) => {
        playSound('click');
        props.setCreateFunction(func);
    };

    const handleEditFuncClick = (func: EditFunction, requiresTwo: boolean) => {
        playSound('click');
        props.setEditFunction(func);
        setShowTwoImages(requiresTwo);
        props.clearUploads();
    };

    const handleAdultClick = () => {
        if (props.isAdultModeUnlocked) handleCreateFuncClick('adult');
        else props.onLockClick();
    };

    const animationClass = isOpen ? 'animate-slideUp' : 'animate-slideDown';
    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-30" onAnimationEnd={onAnimationEnd}>
            <div className="absolute inset-0 bg-black/70" onClick={handleClose}></div>
            <div className={`absolute bottom-0 left-0 right-0 bg-youtube-dark rounded-t-2xl shadow-2xl p-4 flex flex-col gap-4 max-h-[85vh] ${animationClass}`}>
                <div className="w-12 h-1.5 bg-youtube-gray/50 rounded-full mx-auto mb-2" onClick={handleClose}></div>
                <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4">
                    <textarea
                        className="prompt-input w-full bg-youtube-black border border-youtube-gray/50 rounded-lg p-3 h-24 focus:ring-2 focus:ring-youtube-red focus:border-youtube-red transition-colors duration-300 text-sm"
                        placeholder={mode === 'video' ? 'Um gato DJ em uma festa na lua...' : 'Descreva sua ideia...'}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    ></textarea>

                    {mode === 'create' && (
                        <>
                            <div className="grid grid-cols-4 gap-2">
                                <FunctionCard icon="✨" name="Prompt" isActive={props.createFunction === 'free'} onClick={() => handleCreateFuncClick('free')} />
                                <FunctionCard icon="🏷️" name="Adesivo" isActive={props.createFunction === 'sticker'} onClick={() => handleCreateFuncClick('sticker')} />
                                <FunctionCard icon="📝" name="Logo" isActive={props.createFunction === 'text'} onClick={() => handleCreateFuncClick('text')} />
                                <FunctionCard icon="💭" name="HQ" isActive={props.createFunction === 'comic'} onClick={() => handleCreateFuncClick('comic')} />
                                <FunctionCard icon="🖼️" name="Banner" isActive={props.createFunction === 'banner'} onClick={() => handleCreateFuncClick('banner')} />
                                <FunctionCard icon="🎬" name="Thumb" isActive={props.createFunction === 'thumbnail'} onClick={() => handleCreateFuncClick('thumbnail')} />
                                <FunctionCard icon="🔞" name="Adulto" isActive={props.createFunction === 'adult'} onClick={handleAdultClick} isLocked={!props.isAdultModeUnlocked} />
                            </div>
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                            <UploadArea id="imageUploadRef" onUpload={(f) => props.handleImageUpload(f, 'reference')} previewUrl={props.referenceImage?.previewUrl || null} text="Imagem de Referência (Opcional)" />
                             <div className={`transition-opacity duration-300 ${props.referenceImage ? 'opacity-50' : 'opacity-100'}`}>
                                <label className="text-sm font-semibold mb-2 text-youtube-gray block">Variações ({props.variationCount})</label>
                                <input type="range" min="1" max="3" value={props.variationCount} onChange={(e) => props.setVariationCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-youtube-black rounded-lg appearance-none cursor-pointer accent-youtube-red" disabled={!!props.referenceImage} />
                            </div>
                        </>
                    )}

                    {mode === 'edit' && !showTwoImages && (
                        <>
                            <div className="grid grid-cols-4 gap-2">
                                <FunctionCard icon="➕" name="Adicionar" isActive={props.editFunction === 'add-remove'} onClick={() => handleEditFuncClick('add-remove', false)} />
                                <FunctionCard icon="🎯" name="Retoque" isActive={props.editFunction === 'retouch'} onClick={() => handleEditFuncClick('retouch', false)} />
                                <FunctionCard icon="🎨" name="Estilo" isActive={props.editFunction === 'style'} onClick={() => handleEditFuncClick('style', false)} />
                                <FunctionCard icon="🖼️" name="Unir" isActive={props.editFunction === 'compose'} onClick={() => handleEditFuncClick('compose', true)} />
                            </div>
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                            <UploadArea id="imageUpload" onUpload={(f) => props.handleImageUpload(f, 'single')} previewUrl={props.image1?.previewUrl || null} text="Enviar imagem para editar" />
                        </>
                    )}
                    
                    {mode === 'edit' && showTwoImages && (
                        <div className="flex flex-col gap-2">
                            <UploadArea id="imageUpload1" onUpload={(f) => props.handleImageUpload(f, 1)} previewUrl={props.image1?.previewUrl || null} text="Primeira Imagem" />
                            <UploadArea id="imageUpload2" onUpload={(f) => props.handleImageUpload(f, 2)} previewUrl={props.image2?.previewUrl || null} text="Segunda Imagem" />
                            <button className="self-start text-youtube-red/80 hover:text-youtube-red transition-colors text-sm" onClick={() => setShowTwoImages(false)}>← Voltar</button>
                        </div>
                    )}
                     {mode === 'video' && (
                         <div className="bg-youtube-black p-3 rounded-lg text-center">
                             <p className="text-sm font-bold text-youtube-red/80">Sempre geramos 2 variações de vídeo</p>
                         </div>
                    )}
                </div>
                <button
                    className={`w-full bg-youtube-red text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${!isLoading && 'animate-pulse'}`}
                    onClick={generateContent}
                    disabled={isLoading}
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : `🚀 Gerar ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                </button>
            </div>
        </div>
    );
};

export default ControlsDrawer;
