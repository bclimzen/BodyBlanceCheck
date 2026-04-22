import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsReady(false);
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // mediaDevices is only available in secure contexts (HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isHttp = location.protocol === 'http:' && location.hostname !== 'localhost';
        if (isHttp) {
          setError(
            'HTTP 환경에서는 카메라를 사용할 수 없습니다.\n' +
            '아래 방법 중 하나를 사용해주세요:\n' +
            '① PC에서 http://localhost:5173 으로 접속\n' +
            '② ngrok 등으로 HTTPS 주소를 생성하여 접속'
          );
        } else {
          setError('이 브라우저는 카메라를 지원하지 않습니다.');
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.');
      } else if (err.name === 'NotFoundError') {
        setError('카메라를 찾을 수 없습니다.');
      } else {
        setError(`카메라 오류: ${err.message}`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  // Returns an HTMLCanvasElement with the current frame drawn
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Mirror correction: if front camera, flip horizontally
    const track = streamRef.current?.getVideoTracks()[0];
    const settings = track?.getSettings();
    const isFront = settings?.facingMode === 'user';
    if (isFront) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    return canvas;
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, isReady, error, startCamera, stopCamera, captureFrame };
}
