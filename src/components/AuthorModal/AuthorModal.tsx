import React from 'react';
import Icon from '@mdi/react';
import { mdiGithub, mdiEmail, mdiClose } from '@mdi/js';
import './AuthorModal.css';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="author-modal-overlay" onClick={onClose}>
      <div className="author-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="author-modal-close" onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </button>
        
        <div className="author-header">
          <div className="author-avatar">
            <img src="/studynest.svg" alt="StudyNest Logo" style={{ width: '100px', height: '100px' }} />
          </div>
          <h2 className="author-title">About the Author</h2>
          <p className="author-subtitle">Creator of StudyNest</p>
        </div>

        <div className="author-info">
          <a 
            href="https://github.com/hoangnv170752" 
            target="_blank" 
            rel="noopener noreferrer"
            className="author-link"
          >
            <Icon path={mdiGithub} size={1} />
            <div className="link-content">
              <span className="link-label">GitHub</span>
              <span className="link-value">@hoangnv170752</span>
            </div>
          </a>

          <a 
            href="mailto:hoang.nv.ral@gmail.com"
            className="author-link"
          >
            <Icon path={mdiEmail} size={1} />
            <div className="link-content">
              <span className="link-label">Email</span>
              <span className="link-value">hoang.nv.ral@gmail.com</span>
            </div>
          </a>
        </div>

        <div className="author-footer">
          <p className="author-message">
            Thank you for using StudyNest! 🎓
          </p>
          <p className="author-description">
            Built with ❤️ for everyone who value privacy and local-first
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;
