import React, { useRef } from 'react';

interface MainViewProps {
    isLoading: boolean;
    generatedImages: string[] | null;
    generatedVideoUrls: string[] | null;
    videoStatus: string | null;
    editCurrentImage: (index: number) => void;
    onNewContent: () => void;
}

const ActionButton: React.FC<{ icon: string, title: string, onClick?: () => void, href?: string, download?: string }> = 
({ icon, title, onClick, href, download }) => {
    const commonProps = {
        className: "w-14 h-14 bg-youtube-dark/80 rounded-full flex items-center justify-center text-2xl hover:bg-youtube-red transition-all duration-200 transform hover:scale-110 backdrop-blur-sm",
        title: title,
    };
    if (href) {
        return <a {...commonProps} href={href} download={download}>{icon}</a>;
    }
    return <button {...commonProps} onClick={onClick}>{icon}</button>;
};


const MainView: React.FC<MainViewProps> = ({ isLoading, generatedImages, generatedVideoUrls, videoStatus, editCurrentImage, onNewContent }) => {
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center text-youtube-gray">
                    <div className="w-16 h-16 border-4 border-t-transparent border-youtube-red rounded-full animate-spin mx-auto"></div>
                    <div className="mt-4 text-lg animate-pulse">
                        {videoStatus ? videoStatus : "Gerando sua arte..."}
                    </div>
                </div>
            );
        }

        const hasContent = (generatedImages && generatedImages.length > 0) || (generatedVideoUrls && generatedVideoUrls.length > 0);

        if (hasContent) {
            const items = generatedImages || generatedVideoUrls || [];
            const isVideo = !!generatedVideoUrls;
            
            return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                     <div ref={scrollContainerRef} className="w-full flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth">
                        {items.map((itemSrc, index) => (
                             <div key={index} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center relative p-4">
                                {isVideo ? (
                                    <video src={itemSrc} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                ) : (
                                    <img src={itemSrc} alt={`Generated Art ${index + 1}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                )}
                                <div className="absolute bottom-6 flex gap-4">
                                     {!isVideo && <ActionButton icon="✏️" title="Editar" onClick={() => editCurrentImage(index)} />}
                                     <ActionButton 
                                        icon="💾" 
                                        title="Download" 
                                        href={itemSrc}
                                        download={`gerador-youtube-${Date.now()}.${isVideo ? 'mp4' : 'png'}`}
                                    />
                                </div>
                             </div>
                        ))}
                    </div>
                    {items.length > 1 && (
                        <div className="text-center pb-2">
                           <p className="text-sm text-youtube-gray">Deslize para ver as variações</p>
                        </div>
                    )}
                </div>
            );
        }

        // Default placeholder
        return (
            <div className="text-center text-youtube-gray/50">
                <div className="text-7xl">🎨</div>
                <div className="mt-4 text-xl">Sua obra de arte aparecerá aqui</div>
            </div>
        );
    }

    return (
        <main className="flex-grow p-4 flex items-center justify-center overflow-hidden">
           {renderContent()}
        </main>
    );
};

export default MainView;
