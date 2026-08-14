import { Platform } from 'react-native';

export const applyWatermarkWeb = async (
  base64Uri: string, 
  jobName: string
): Promise<string> => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return base64Uri;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Uri);
          return;
        }
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Calculate scale relative to a standard 1080p width to make text responsive
        const scale = Math.max(1, canvas.width / 1080);
        
        // Define watermark box
        const pad = 30 * scale;
        const boxHeight = 160 * scale;
        const x = pad;
        const y = canvas.height - boxHeight - pad;
        
        // Draw background box (semi-transparent black)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        // Fallback for older browsers that don't support roundRect
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, 600 * scale, boxHeight, 15 * scale);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, 600 * scale, boxHeight);
        }
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';
        
        // Line 1: Date
        ctx.font = `bold ${32 * scale}px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillText(new Date().toLocaleString(), x + pad, y + pad);
        
        // Line 2: Job Name
        ctx.font = `600 ${28 * scale}px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
        // Truncate job name if too long
        const safeJobName = jobName.length > 35 ? jobName.substring(0, 32) + '...' : jobName;
        ctx.fillText(safeJobName, x + pad, y + pad + 45 * scale);
        
        // Line 3: Verified Entry
        ctx.font = `400 ${20 * scale}px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
        ctx.globalAlpha = 0.8;
        ctx.fillText('Verified Entry', x + pad, y + pad + 90 * scale);
        ctx.globalAlpha = 1.0;
        
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) {
        console.error('Watermark generation failed', e);
        resolve(base64Uri); // Fallback to unwatermarked
      }
    };
    img.onerror = () => resolve(base64Uri);
    img.src = base64Uri;
  });
};

export const downloadWebImage = (base64Uri: string, filename: string) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const link = document.createElement('a');
      link.href = base64Uri;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to trigger download', err);
    }
  }
};
