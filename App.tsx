import React, { useState, useCallback, useEffect } from 'react';
import type { Mode, CreateFunction, EditFunction, UploadedImage, AspectRatio } from './types';
import MainView from './components/MainView';
import BottomNav from './components/BottomNav';
import ControlsDrawer from './components/ControlsDrawer';
import CodeModal from './components/CodeModal';
import AssistantButton from './components/AssistantButton';
import AssistantModal from './components/AssistantModal';
import { generateImageApi, editImageApi, fileToGenerativePart, generateVideoApi } from './services/geminiService';
import playSound, { initAudioContext } from './services/audioService';

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<Mode>('create');
  const [createFunction, setCreateFunction] = useState<CreateFunction>('free');
  const [editFunction, setEditFunction] = useState<EditFunction>('add-remove');
  
  const [image1, setImage1] = useState<UploadedImage | null>(null);
  const [image2, setImage2] = useState<UploadedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [generatedVideoUrls, setGeneratedVideoUrls] = useState<string[] | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);

  const [variationCount, setVariationCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [error, setError] = useState<string | null>(null);

  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setCodeModalOpen] = useState<boolean>(false);
  const [isAdultModeUnlocked, setAdultModeUnlocked] = useState<boolean>(false);

  // AI Assistant State
  const [isAssistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    initAudioContext();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    if (error) {
      playSound('error');
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleImageUpload = (file: File, imageSlot: 1 | 2 | 'single' | 'reference') => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const uploadedImage = { file, previewUrl };
      if (imageSlot === 1) setImage1(uploadedImage);
      else if (imageSlot === 2) setImage2(uploadedImage);
      else if (imageSlot === 'reference') setReferenceImage(uploadedImage);
      else setImage1(uploadedImage);
      playSound('click');
    }
  };

  const clearUploads = () => {
    setImage1(null);
    setImage2(null);
    setReferenceImage(null);
  };
  
  const handleModeChange = (newMode: Mode) => {
    playSound('open');
    setMode(newMode);
    clearUploads();
    setGeneratedImages(null);
    setGeneratedVideoUrls(null);
    setDrawerOpen(true);
    if(newMode === 'edit') setCreateFunction('free');
    else setEditFunction('add-remove');
  };

  const generateContent = useCallback(async () => {
    if (!prompt) {
      setError('Por favor, descreva sua ideia.');
      return;
    }
    
    playSound('click');
    setDrawerOpen(false);
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    setGeneratedVideoUrls(null);
    setVideoStatus(null);

    try {
      if (mode === 'video') {
        const videoUrls = await generateVideoApi(prompt, setVideoStatus);
        setGeneratedVideoUrls(videoUrls);
      } else {
        let resultImages: string[] | null = null;
        if (mode === 'create') {
          if (referenceImage) {
              const imagePart = await fileToGenerativePart(referenceImage.file);
              const enhancedPrompt = `Based on the style, colors, and composition of the provided image, generate a new image depicting: ${prompt}`;
              const singleResult = await editImageApi(enhancedPrompt, [imagePart], aspectRatio);
              resultImages = singleResult ? [singleResult] : null;
          } else {
              let enhancedPrompt = prompt;
              if (createFunction === 'sticker') enhancedPrompt = `design a vinyl sticker of ${prompt}, simple, vector, vibrant colors, white background`;
              if (createFunction === 'text') enhancedPrompt = `typography logo design for "${prompt}", clean, modern, vector, on a solid background`;
              if (createFunction === 'comic') enhancedPrompt = `${prompt} in a dynamic comic book panel style, vibrant colors, bold lines, action-packed`;
              if (createFunction === 'banner') enhancedPrompt = `"${prompt}", professional banner design for a website, wide aspect ratio, high resolution, visually appealing`;
              if (createFunction === 'thumbnail') enhancedPrompt = `"${prompt}", eye-catching YouTube thumbnail, vibrant colors, bold text, high contrast, 16:9 aspect ratio`;
              if (createFunction === 'adult') enhancedPrompt = `mature themes, nsfw, photorealistic, ${prompt}`;
              
              resultImages = await generateImageApi(enhancedPrompt, variationCount, aspectRatio);
          }
        } else { // EDIT MODE
          if (!image1) {
            setError('Por favor, envie uma imagem para editar.');
            setIsLoading(false);
            return;
          }
          const imagePart1 = await fileToGenerativePart(image1.file);
          const imageParts = [imagePart1];
          if (editFunction === 'compose' && image2) {
              const imagePart2 = await fileToGenerativePart(image2.file);
              imageParts.push(imagePart2);
          }
          const singleResult = await editImageApi(prompt, imageParts, aspectRatio);
          resultImages = singleResult ? [singleResult] : null;
        }
        
        if (resultImages && resultImages.length > 0) {
          const imagesWithPrefix = resultImages.map(img => `data:image/png;base64,${img}`);
          setGeneratedImages(imagesWithPrefix);
        } else {
          throw new Error('A API não retornou uma imagem.');
        }
      }
      playSound('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      setVideoStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, mode, createFunction, editFunction, image1, image2, referenceImage, variationCount, aspectRatio, isAdultModeUnlocked]);

  const editCurrentImage = (index: number) => {
    if (generatedImages && generatedImages[index]) {
      fetch(generatedImages[index])
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "edited_image.png", { type: "image/png" });
          handleImageUpload(file, 'single');
          setMode('edit');
          setDrawerOpen(true);
          setGeneratedImages(null);
        });
    }
  };

  return (
    <div className="w-full h-full bg-youtube-black flex flex-col overflow-hidden">
        <header className="p-4 text-center">
            <h1 className="text-2xl font-bold tracking-wider text-youtube-white">
                <span className="text-youtube-red">G</span>erador <span className="text-youtube-red">Y</span>ouTube
            </h1>
        </header>

        <MainView
            isLoading={isLoading}
            generatedImages={generatedImages}
            generatedVideoUrls={generatedVideoUrls}
            videoStatus={videoStatus}
            editCurrentImage={editCurrentImage}
            onNewContent={() => {
                setGeneratedImages(null);
                setGeneratedVideoUrls(null);
                handleModeChange('create');
            }}
        />

        <BottomNav
            currentMode={mode}
            onModeChange={handleModeChange}
        />

        <ControlsDrawer
            isOpen={isDrawerOpen}
            onClose={() => setDrawerOpen(false)}
            prompt={prompt}
            setPrompt={setPrompt}
            mode={mode}
            createFunction={createFunction}
            setCreateFunction={setCreateFunction}
            editFunction={editFunction}
            setEditFunction={setEditFunction}
            image1={image1}
            image2={image2}
            referenceImage={referenceImage}
            handleImageUpload={handleImageUpload}
            generateContent={generateContent}
            isLoading={isLoading}
            variationCount={variationCount}
            setVariationCount={setVariationCount}
            isAdultModeUnlocked={isAdultModeUnlocked}
            onLockClick={() => {
                playSound('click');
                setCodeModalOpen(true);
            }}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            clearUploads={clearUploads}
        />
        
        <AssistantButton onClick={() => setAssistantOpen(true)} />

        <AssistantModal 
            isOpen={isAssistantOpen}
            onClose={() => setAssistantOpen(false)}
            isOnline={isOnline}
        />

        {error && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-youtube-red text-white py-2 px-4 rounded-lg shadow-lg animate-fadeIn z-50" onClick={() => setError(null)}>
                <p><strong>Erro:</strong> {error}</p>
            </div>
        )}

        <CodeModal 
            isOpen={isCodeModalOpen}
            onClose={() => setCodeModalOpen(false)}
            onSuccess={() => {
                playSound('success');
                setAdultModeUnlocked(true);
                setCodeModalOpen(false);
                setCreateFunction('adult');
            }}
        />
    </div>
  );
}

export default App;