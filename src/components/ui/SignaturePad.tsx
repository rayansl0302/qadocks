import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  /** PNG com fundo transparente, recortado ao traço. Vazio se nada foi desenhado. */
  toDataUrl: () => string;
}

const WIDTH = 640;
const HEIGHT = 200;
const INK = '#111827';

export function SignaturePad({ handleRef }: { handleRef: Ref<SignaturePadHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);
  const emptyRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ratio = window.devicePixelRatio || 1;
    canvas.width = WIDTH * ratio;
    canvas.height = HEIGHT * ratio;
    const context = canvas.getContext('2d');
    if (context) {
      context.scale(ratio, ratio);
      context.lineWidth = 2.4;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = INK;
    }
  }, []);

  function position(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = position(event);
    context.beginPath();
    context.moveTo(x, y);
    // Ponto simples para um toque sem arrastar.
    context.lineTo(x + 0.01, y + 0.01);
    context.stroke();
    emptyRef.current = false;
    setEmpty(false);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) {
      return;
    }
    const context = canvasRef.current?.getContext('2d');
    if (!context) {
      return;
    }
    const { x, y } = position(event);
    context.lineTo(x, y);
    context.stroke();
  }

  function stop() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    emptyRef.current = true;
    setEmpty(true);
  }

  function toDataUrl(): string {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || emptyRef.current) {
      return '';
    }
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] > 0) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX < 0) {
      return '';
    }
    const padding = 8;
    const sx = Math.max(0, minX - padding);
    const sy = Math.max(0, minY - padding);
    const sw = Math.min(width, maxX + padding) - sx;
    const sh = Math.min(height, maxY + padding) - sy;
    const output = document.createElement('canvas');
    output.width = sw;
    output.height = sh;
    output.getContext('2d')?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return output.toDataURL('image/png');
  }

  useImperativeHandle(handleRef, () => ({ clear, isEmpty: () => emptyRef.current, toDataUrl }));

  return (
    <div>
      <div className="relative rounded-xl border border-dashed border-line bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none rounded-xl"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, cursor: 'crosshair' }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        />
        {empty ? (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
            Assine aqui com o mouse, o dedo ou a caneta
          </p>
        ) : null}
      </div>
    </div>
  );
}
