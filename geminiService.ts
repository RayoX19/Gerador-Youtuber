import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to a base64 string and return a Part object
export const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: base64String,
        },
    };
};

export const generateImageApi = async (prompt: string, numberOfImages: number = 1, aspectRatio: string = '1:1'): Promise<string[] | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => img.image.imageBytes);
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Falha ao gerar a imagem. Verifique o console para mais detalhes.");
    }
};

export const editImageApi = async (prompt: string, images: Part[], aspectRatio: string = '1:1'): Promise<string | null> => {
    try {
        const contents = {
            parts: [...images, { text: `${prompt}. The final image should have a ${aspectRatio} aspect ratio.` }],
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        // If no image is returned, check for text which might contain a reason
        for (const part of response.candidates[0].content.parts) {
             if (part.text) {
                throw new Error(`API returned text instead of image: ${part.text}`);
            }
        }

        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Falha ao editar a imagem. Verifique o console para mais detalhes.");
    }
};

export const generateVideoApi = async (prompt: string, onProgress: (status: string) => void): Promise<string[]> => {
    try {
        onProgress("Iniciando a operação de geração de vídeo...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 2
            }
        });

        onProgress("Operação iniciada. Gerando 2 variações... Isso pode levar alguns minutos.");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            onProgress("Verificando o status dos vídeos...");
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const generatedVideos = operation.response?.generatedVideos;
        if (!generatedVideos || generatedVideos.length === 0) {
            throw new Error("A API de vídeo não retornou nenhum vídeo.");
        }
        
        onProgress(`Vídeos gerados com sucesso! Baixando ${generatedVideos.length} arquivos...`);
        
        const videoUrls = await Promise.all(
            generatedVideos.map(async (videoData) => {
                const downloadLink = videoData?.video?.uri;
                if (!downloadLink) {
                    console.warn("Uma das variações de vídeo não retornou um link para download.");
                    return null;
                }
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error(`Falha ao baixar o vídeo. Status: ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                return URL.createObjectURL(videoBlob);
            })
        );
        
        const validUrls = videoUrls.filter((url): url is string => url !== null);

        if (validUrls.length === 0) {
            throw new Error("Falha ao processar os links de download dos vídeos.");
        }
        
        return validUrls;

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Falha ao gerar o vídeo. Verifique o console para mais detalhes.");
    }
};

export const getGenericTextResponse = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Você é um assistente prestativo para um aplicativo de geração de mídia chamado 'Gerador YouTube'. Responda de forma concisa e amigável.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting text response:", error);
        throw new Error("Não consegui encontrar uma resposta online. Tente novamente mais tarde.");
    }
};