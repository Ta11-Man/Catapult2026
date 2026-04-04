import html2canvas from 'html2canvas';

export default function DownloadButton({ gridRef }) {
  const handleDownload = async () => {
    if (!gridRef.current) return;

    const previousTransform = gridRef.current.style.transform;
    gridRef.current.style.transform = 'scale(1)';

    try {
      const canvas = await html2canvas(gridRef.current, {
        useCORS: true,
        backgroundColor: '#F9F8F6'
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'proof-of-attrition.png';
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      gridRef.current.style.transform = previousTransform;
    }
  };

  return (
    <button type="button" className="download-button" onClick={handleDownload}>
      Download Canvas
    </button>
  );
}

