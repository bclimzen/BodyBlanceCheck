import { useState, useEffect, useRef, useCallback } from 'react';
import { MEDIAPIPE_WASM_URL, MEDIAPIPE_MODEL_URL } from '../utils/constants';

export function usePoseDetection() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (mounted) {
          detectorRef.current = landmarker;
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setLoadError(`MediaPipe 로드 실패: ${err.message}`);
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Detect pose from an HTMLCanvasElement or HTMLImageElement
  const detectPose = useCallback(async (imageSource) => {
    if (!detectorRef.current) return null;
    try {
      const result = detectorRef.current.detect(imageSource);
      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0];
      }
      return null;
    } catch (err) {
      console.error('Pose detection error:', err);
      return null;
    }
  }, []);

  return { detectPose, isLoading, loadError };
}
