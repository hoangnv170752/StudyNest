import React, { useEffect, useState, useRef } from 'react';
import { Fireworks } from 'fireworks-js';
import './DonationModal.css';
import qrCodeImage from '../../assets/buy-me-qr-code.png';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const fireworksRef = useRef<HTMLDivElement>(null);
  const fireworksInstance = useRef<Fireworks | null>(null);

  useEffect(() => {
    if (isOpen) {
      const newFireflies: Firefly[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      }));
      setFireflies(newFireflies);

      // Initialize fireworks
      if (fireworksRef.current && !fireworksInstance.current) {
        fireworksInstance.current = new Fireworks(fireworksRef.current, {
          autoresize: true,
          opacity: 0.5,
          acceleration: 1.05,
          friction: 0.97,
          gravity: 1.5,
          particles: 50,
          traceLength: 3,
          traceSpeed: 10,
          explosion: 5,
          intensity: 30,
          flickering: 50,
          lineStyle: 'round',
          hue: {
            min: 0,
            max: 360
          },
          delay: {
            min: 30,
            max: 60
          },
          rocketsPoint: {
            min: 50,
            max: 50
          },
          lineWidth: {
            explosion: {
              min: 1,
              max: 3
            },
            trace: {
              min: 1,
              max: 2
            }
          },
          brightness: {
            min: 50,
            max: 80
          },
          decay: {
            min: 0.015,
            max: 0.03
          },
          mouse: {
            click: false,
            move: false,
            max: 1
          }
        });
        fireworksInstance.current.start();
      }
    }

    return () => {
      if (fireworksInstance.current) {
        fireworksInstance.current.stop();
        fireworksInstance.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="donation-modal-overlay" onClick={onClose}>
      <div className="donation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div ref={fireworksRef} className="fireworks-container" />
        
        <button className="donation-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="fireflies-container">
          {fireflies.map((firefly) => (
            <div
              key={firefly.id}
              className="firefly"
              style={{
                left: `${firefly.x}%`,
                top: `${firefly.y}%`,
                width: `${firefly.size}px`,
                height: `${firefly.size}px`,
                animationDuration: `${firefly.duration}s`,
                animationDelay: `${firefly.delay}s`
              }}
            />
          ))}
        </div>

        <div className="donation-content">
          <h2 className="donation-title">☕ Support StudyNest</h2>
          <p className="donation-description">
            If you find StudyNest helpful, consider buying me a coffee!
            Your support helps keep this project alive and free.
          </p>
          
          <div className="qr-code-container">
            <img 
              src={qrCodeImage}
              alt="Donation QR Code" 
              className="qr-code-image"
            />
          </div>

          <p className="donation-thank-you">
            Thank you for your support! 💚
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
