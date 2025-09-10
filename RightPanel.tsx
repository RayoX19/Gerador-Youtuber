import React from 'react';
import type { Mode } from '../types';

interface RightPanelProps {
    mode: Mode;
    isLoading: boolean;
    generatedImages: string[] | null;
    generatedVideoUrls: string[] | null;
    videoStatus: string | null;
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    editCurrentImage: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ mode, isLoading, generatedImages, generatedVideoUrls, videoStatus, selectedImageIndex, setSelectedImageIndex, editCurrentImage }) => {

    const downloadImage = () => {
        if (!generatedImages || generatedImages.length === 0) return;
        const link = document.createElement('a');
        link.href = generatedImages[selectedImageIndex];
        link.download = `ai-image-${Date.now()}-${selectedImageIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedImage = generatedImages ? generatedImages[selectedImageIndex] : null;

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div id="loadingContainer" className="loading-container text-center text-gray-400">
                    <div className="loading-spinner w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <div className="loading-text mt-4 text-lg">
                        {mode === 'video' && videoStatus ? videoStatus : "Gerando sua imagem..."}
                    </div>
                </div>
            );
        }

        if (mode === 'video' && generatedVideoUrls && generatedVideoUrls.length > 0) {
            return (
                <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-6">
                    {generatedVideoUrls.map((videoUrl, index) => (
                        <div key={index} className="flex flex-col items-center justify-center gap-3 w-full md:w-1/2 max-h-full">
                             <p className="font-semibold text-gray-300">Variação {index + 1}</p>
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-auto max-h-[70%] rounded-lg shadow-2xl"
                            />
                            <a
                                href={videoUrl}
                                download={`ai-video-${Date.now()}-var${index + 1}.mp4`}
                                className="action-btn w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-indigo-600 transition-colors"
                                title={`Download Variação ${index + 1}`}
                            >
                                💾
                            </a>
                        </div>
                    ))}
                </div>
            )
        }

        if ((mode === 'create' || mode === 'edit') && generatedImages && selectedImage) {
            return (
                 <div id="imageContainer" className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="flex-grow flex items-center justify-center w-full max-h-[calc(100%-140px)]">
                         <img id="generatedImage" src={selectedImage} alt="Generated Art" className="generated-image max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    </div>
                   
                    <div className="w-full flex flex-col items-center gap-4">
                        <div className="image-actions flex gap-4 p-2 bg-gray-900/50 rounded-full">
                            <button className="action-btn w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-indigo-600 transition-colors" onClick={editCurrentImage} title="Editar">
                                ✏️
                            </button>
                            <button className="action-btn w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl hover:bg-indigo-600 transition-colors" onClick={downloadImage} title="Download">
                                💾
                            </button>
                        </div>

                        {generatedImages.length > 1 && (
                            <div className="w-full max-w-xl overflow-x-auto p-2">
                                <div className="flex justify-center gap-3">
                                    {generatedImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Variation ${index + 1}`}
                                            className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all duration-200 flex-shrink-0 ${selectedImageIndex === index ? 'ring-4 ring-indigo-500 scale-105' : 'ring-2 ring-transparent hover:ring-indigo-400'}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        // Default placeholder
        return (
             <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                <div className="result-placeholder-icon text-7xl">🎨</div>
                <div className="mt-4 text-2xl">Sua obra de arte aparecerá aqui</div>
            </div>
        )
    }

    return (
        <div className="right-panel w-full md:w-2/3 lg:w-3/4 bg-gray-800/50 p-6 rounded-2xl flex items-center justify-center min-h-[50vh] md:min-h-0 relative overflow-hidden hidden md:flex">
           {renderContent()}
        </div>
    );
};

export default RightPanel;