'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { downloadFile } from '@/lib/files';

export default function DownloadButton({
  path,
  label = 'Download',
  className = '',
}: {
  path: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setBusy(true);
    setError('');
    try {
      await downloadFile(path);
    } catch {
      setError('Download failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={handleClick} disabled={busy} className={className}>
        <Download size={16} /> {busy ? 'Downloading...' : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}