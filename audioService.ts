// Create a singleton audio context
let audioContext: AudioContext | null = null;

const initializeAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
};

const playSound = (type: 'click' | 'success' | 'error' | 'open') => {
    // User must interact with the page first for audio to play
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext?.resume();
    }
    if (!audioContext) return;


    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime); // Volume

    switch (type) {
        case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440.0, audioContext.currentTime); // A4
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
            break;
        case 'open':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660.0, audioContext.currentTime); 
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
            break;
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
            break;
        case 'error':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(220.0, audioContext.currentTime); // A3
            oscillator.frequency.exponentialRampToValueAtTime(110.0, audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
            break;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
};

// Export a function to be called on the first user interaction
export const initAudioContext = () => {
    const init = () => {
        initializeAudio();
        document.body.removeEventListener('click', init);
        document.body.removeEventListener('touchstart', init);
    };
    document.body.addEventListener('click', init, { once: true });
    document.body.addEventListener('touchstart', init, { once: true });
};

export default playSound;
