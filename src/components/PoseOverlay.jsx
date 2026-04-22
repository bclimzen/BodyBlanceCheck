import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../utils/constants';

export default function PoseOverlay({ landmarks, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw skeleton connections
    ctx.lineWidth = 2.5;
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      if (p1?.visibility > 0.5 && p2?.visibility > 0.5) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Draw landmark dots
    landmarks.forEach((lm) => {
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
