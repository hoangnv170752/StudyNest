import React, { useState, useEffect } from 'react';
import { Chat } from './screens';
import { ModelDownload } from './components';

const App: React.FC = () => {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkModelStatus = async () => {
      if (!window.electron?.model) {
        setIsModelReady(true);
        setIsLoading(false);
        return;
      }

      try {
        const isFirstRun = await window.electron.model.isFirstRun();
        const isDownloaded = await window.electron.model.isDownloaded();

        if (!isFirstRun && isDownloaded) {
          setIsModelReady(true);
        }
      } catch (error) {
        console.error('Error checking model status:', error);
        setIsModelReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkModelStatus();
  }, []);

  const handleDownloadComplete = () => {
    setIsModelReady(true);
  };

  if (isLoading) {
    return null;
  }

  if (!isModelReady) {
    return <ModelDownload onComplete={handleDownloadComplete} />;
  }

  return <Chat />;
};

export default App;
