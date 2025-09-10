import React, { useRef } from 'react';
import type { Mode, CreateFunction, EditFunction, UploadedImage, AspectRatio } from '../types';

interface LeftPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    mode: Mode;
    handleModeChange: (mode: Mode) => void;
    createFunction: CreateFunction;
    setCreateFunction: (func: CreateFunction) => void;
    editFunction: EditFunction;
    handleEditFunctionChange: (func: EditFunction, requiresTwo: boolean) => void;
    showTwoImagesSection: boolean;
    setShowTwoImagesSection: (show: boolean) => void;
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
}

const FunctionCard: React.FC<{
    icon: string;
    name: string;
    isActive: boolean;
    onClick: () => void;
    'data-function': string;
    'data-requires-two'?: boolean;
    isLocked?: boolean;
}> = ({ icon, name, isActive, onClick, isLocked = false, ...dataProps }) => (
    <div
        {...dataProps}
        className={`function-card p-3 rounded-lg text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center aspect-square ${isActive ? 'bg-indigo-600 scale-105 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
        onClick={onClick}
    >
        <div className="text-3xl mb-1 relative">
            {icon}
            {isLocked && <span className="absolute -top-1 -right-2 text-base">🔒</span>}
        </div>
        <div className="font-semibold text-sm">{name}</div>
    </div>
);

const UploadArea: React.FC<{
    id: string;
    onUpload: (file: File) => void;
    previewUrl: string | null;
    text: string;
    subtext: string;
    isDual?: boolean;
}> = ({ id, onUpload, previewUrl, text, subtext, isDual = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div 
            className={`${isDual ? 'upload-area-dual' : 'upload-area'} w-full border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors duration-300 bg-gray-800/50 relative overflow-hidden h-40 flex flex-col items-center justify-center`}
            onClick={() => inputRef.current?.click()}
        >
            <input
                type="file"
                id={id}
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover" />
            ) : (
                <>
                    <div className="text-3xl text-gray-400">📁</div>
                    <p className="font-semibold mt-2">{text}</p>
                    <p className="upload-text text-xs text-gray-500">{subtext}</p>
                </>
            )}
        </div>
    );
};

const AspectRatioSelector: React.FC<{ value: AspectRatio, onChange: (value: AspectRatio) => void }> = ({ value, onChange }) => {
    const ratios: { name: string, value: AspectRatio, icon: string }[] = [
        { name: 'Quadrado', value: '1:1', icon: '■' },
        { name: 'Paisagem', value: '16:9', icon: '▬' },
        { name: 'Retrato', value: '9:16', icon: '▮' },
        { name: 'Largo', value: '4:3', icon: '▭' },
        { name: 'Alto', value: '3:4', icon: '▯' },
    ];
    return (
        <div>
            <div className="section-title font-semibold mb-2 text-gray-300">📐 Proporção</div>
            <div className="grid grid-cols-5 gap-2">
                {ratios.map(ratio => (
                    <button 
                        key={ratio.value} 
                        onClick={() => onChange(ratio.value)}
                        title={ratio.name}
                        className={`p-2 rounded-md flex flex-col items-center justify-center transition-colors duration-200 ${value === ratio.value ? 'bg-indigo-600 font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <span className="text-xl">{ratio.icon}</span>
                        <span className="text-xs mt-1">{ratio.value}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


const LeftPanel: React.FC<LeftPanelProps> = ({
    prompt, setPrompt, mode, handleModeChange, createFunction, setCreateFunction,
    editFunction, handleEditFunctionChange, showTwoImagesSection, setShowTwoImagesSection,
    image1, image2, referenceImage, handleImageUpload, generateContent, isLoading, 
    variationCount, setVariationCount, isAdultModeUnlocked, onLockClick,
    aspectRatio, setAspectRatio
}) => {

    const handleAdultClick = () => {
        if (isAdultModeUnlocked) {
            setCreateFunction('adult');
        } else {
            onLockClick();
        }
    };

    return (
        <div className="left-panel w-full md:w-1/3 lg:w-1/4 bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col gap-6 overflow-y-auto max-h-[95vh]">
            <header className="relative">
                <h1 className="panel-title text-3xl font-bold text-white">🎨 AI Image Studio</h1>
                <p className="panel-subtitle text-gray-400">Gerador profissional de imagens</p>
            </header>

            <div className="prompt-section">
                <div className="section-title font-semibold mb-2 text-gray-300">
                    {mode === 'video' ? '🎬 Descreva seu vídeo' : '💭 Descreva sua ideia'}
                </div>
                <textarea
                    id="prompt"
                    className="prompt-input w-full bg-gray-900 border border-gray-700 rounded-lg p-3 h-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder={mode === 'video' ? 'Um astronauta surfando em uma onda cósmica...' : 'Descreva a imagem que você deseja criar...'}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
            </div>

            <div className="mode-toggle grid grid-cols-3 gap-2 bg-gray-900 p-1 rounded-lg">
                <button
                    className={`mode-btn py-2 rounded-md transition-colors duration-300 ${mode === 'create' ? 'bg-indigo-600 font-semibold' : 'hover:bg-gray-700'}`}
                    onClick={() => handleModeChange('create')}
                >
                    Criar
                </button>
                <button
                    className={`mode-btn py-2 rounded-md transition-colors duration-300 ${mode === 'edit' ? 'bg-indigo-600 font-semibold' : 'hover:bg-gray-700'}`}
                    onClick={() => handleModeChange('edit')}
                >
                    Editar
                </button>
                <button
                    className={`mode-btn py-2 rounded-md transition-colors duration-300 ${mode === 'video' ? 'bg-indigo-600 font-semibold' : 'hover:bg-gray-700'}`}
                    onClick={() => handleModeChange('video')}
                >
                    Vídeo
                </button>
            </div>

            {mode === 'create' && (
                <>
                    <div id="createFunctions" className="functions-section">
                        <div className="functions-grid grid grid-cols-3 gap-2">
                            <FunctionCard icon="✨" name="Prompt" data-function="free" isActive={createFunction === 'free'} onClick={() => setCreateFunction('free')} />
                            <FunctionCard icon="🏷️" name="Adesivos" data-function="sticker" isActive={createFunction === 'sticker'} onClick={() => setCreateFunction('sticker')} />
                            <FunctionCard icon="📝" name="Logo" data-function="text" isActive={createFunction === 'text'} onClick={() => setCreateFunction('text')} />
                            <FunctionCard icon="💭" name="HQ" data-function="comic" isActive={createFunction === 'comic'} onClick={() => setCreateFunction('comic')} />
                            <FunctionCard icon="🖼️" name="Banner" data-function="banner" isActive={createFunction === 'banner'} onClick={() => setCreateFunction('banner')} />
                            <FunctionCard icon="🎬" name="Thumbnail" data-function="thumbnail" isActive={createFunction === 'thumbnail'} onClick={() => setCreateFunction('thumbnail')} />
                            <FunctionCard icon="🔞" name="Adulto" data-function="adult" isActive={createFunction === 'adult'} onClick={handleAdultClick} isLocked={!isAdultModeUnlocked} />
                        </div>
                    </div>
                    <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                </>
            )}
            
            {mode === 'video' && (
                 <div className="flex flex-col gap-4">
                    <div className="bg-gray-900 p-3 rounded-lg text-center">
                         <p className="text-sm font-bold text-indigo-300">Sempre geramos 2 variações de vídeo</p>
                         <p className="text-xs text-gray-400">Compare os resultados e escolha o melhor.</p>
                    </div>
                </div>
            )}

            {mode === 'edit' && !showTwoImagesSection && (
                 <>
                    <div id="editFunctions" className="functions-section">
                        <div className="functions-grid grid grid-cols-2 gap-4">
                            <FunctionCard icon="➕" name="Adicionar" data-function="add-remove" isActive={editFunction === 'add-remove'} onClick={() => handleEditFunctionChange('add-remove', false)} />
                            <FunctionCard icon="🎯" name="Retoque" data-function="retouch" isActive={editFunction === 'retouch'} onClick={() => handleEditFunctionChange('retouch', false)} />
                            <FunctionCard icon="🎨" name="Estilo" data-function="style" isActive={editFunction === 'style'} onClick={() => handleEditFunctionChange('style', false)} />
                            <FunctionCard icon="🖼️" name="Unir" data-function="compose" data-requires-two={true} isActive={editFunction === 'compose'} onClick={() => handleEditFunctionChange('compose', true)} />
                        </div>
                    </div>
                     <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                </>
            )}
            
            {showTwoImagesSection && (
                <div id="twoImagesSection" className="functions-section flex flex-col gap-4">
                    <div className="section-title font-semibold text-gray-300">📸 Duas Imagens Necessárias</div>
                    <UploadArea id="imageUpload1" onUpload={(file) => handleImageUpload(file, 1)} previewUrl={image1?.previewUrl || null} text="Primeira Imagem" subtext="Clique para selecionar" isDual={true} />
                    <UploadArea id="imageUpload2" onUpload={(file) => handleImageUpload(file, 2)} previewUrl={image2?.previewUrl || null} text="Segunda Imagem" subtext="Clique para selecionar" isDual={true} />
                    <button className="back-btn self-start text-indigo-400 hover:text-indigo-300 transition-colors" onClick={() => setShowTwoImagesSection(false)}>
                        ← Voltar para Edição
                    </button>
                </div>
            )}

            <div className="dynamic-content mt-auto flex flex-col gap-4">
                {mode === 'create' && (
                  <>
                    <div className="reference-image-section">
                        <div className="section-title font-semibold mb-2 text-gray-300">🖼️ Imagem de Referência (Opcional)</div>
                         <UploadArea id="imageUploadRef" onUpload={(file) => handleImageUpload(file, 'reference')} previewUrl={referenceImage?.previewUrl || null} text="Usar como inspiração" subtext="PNG, JPG, WebP" />
                    </div>
                    <div className={`variation-options transition-opacity duration-300 ${referenceImage ? 'opacity-50' : 'opacity-100'}`}>
                        <label htmlFor="variation-slider" className="section-title font-semibold mb-2 text-gray-300 block">
                            🔢 Número de Variações ({variationCount})
                        </label>
                        <input
                            id="variation-slider"
                            type="range"
                            min="1"
                            max="3"
                            value={variationCount}
                            onChange={(e) => setVariationCount(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            disabled={!!referenceImage}
                        />
                    </div>
                  </>
                )}

                {mode === 'edit' && !showTwoImagesSection && (
                    <UploadArea id="imageUpload" onUpload={(file) => handleImageUpload(file, 'single')} previewUrl={image1?.previewUrl || null} text="Clique ou arraste para manipular" subtext="PNG, JPG, WebP (máx. 10MB)" />
                )}
                
                <button
                    id="generateBtn"
                    className="generate-btn w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg mt-2 flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={generateContent}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                            <span className="btn-text">Gerando...</span>
                        </>
                    ) : (
                        <span className="btn-text">
                            🚀 Gerar {mode === 'video' ? 'Vídeo' : 'Imagem'}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LeftPanel;