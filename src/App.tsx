import { useState } from 'react';
import { socket } from './ws';

let audioChunks: Blob[] = [];

function App() {
  const [voice, setVoice] = useState<MediaRecorder | null>(null);

  socket.on('voice', (audioBlob) => {
    try {
      const data = new Blob([audioBlob], { type: 'audio/wav' }); // Pastikan tipe sesuai
      const audioUrl = URL.createObjectURL(data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <button
        onPointerDown={async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });

            const media = new MediaRecorder(stream);
            setVoice(media);

            media.ondataavailable = (event) => {
              audioChunks.push(event.data);
            };

            media.onstop = () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
              audioChunks = []; // Reset for the next recording

              // Emit audio blob via Socket.io to the server
              socket.emit('voice', audioBlob);
            };

            media.start();
            console.log('voice start');
          } catch (error) {
            console.log(error);
          }
        }}
        onPointerUp={() => {
          if (voice) {
            voice.stop();
            console.log('voice stop');
          }
        }}
      >
        klik
      </button>
    </>
  );
}

export default App;
