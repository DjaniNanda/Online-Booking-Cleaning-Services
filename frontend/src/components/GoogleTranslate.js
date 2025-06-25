import React, { useState, useEffect } from 'react';

const GoogleTranslate = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const languageOptions = [
    { code: 'auto', name: 'Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }
  ];

  const getLanguageName = (code) => {
    const lang = languageOptions.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  // Simple translation function using Google Translate (client-side)
  const translatePage = async () => {
    setIsTranslating(true);
    
    try {
      // Add Google Translate script if not already present
      if (!window.google || !window.google.translate) {
        await loadGoogleTranslateScript();
      }
      
      // Initialize Google Translate
      if (window.google && window.google.translate) {
        // Create a hidden translate element
        const translateElement = document.createElement('div');
        translateElement.id = 'hidden-google-translate';
        translateElement.style.display = 'none';
        document.body.appendChild(translateElement);
        
        new window.google.translate.TranslateElement({
          pageLanguage: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
          includedLanguages: targetLanguage,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'hidden-google-translate');
        
        // Trigger translation
        setTimeout(() => {
          const selectElement = document.querySelector('#hidden-google-translate select');
          if (selectElement) {
            selectElement.value = targetLanguage;
            selectElement.dispatchEvent(new Event('change'));
            setIsTranslated(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const loadGoogleTranslateScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.translate) {
        resolve();
        return;
      }
      
      window.googleTranslateElementInit = () => {
        resolve();
      };
      
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const revertTranslation = () => {
    // Reload the page to revert translation
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="position-fixed" style={{ 
      top: '10px', 
      right: '10px', 
      zIndex: 1050,
      minWidth: '320px'
    }}>
      <div className="bg-white border rounded-3 shadow-sm p-3" style={{
        borderColor: '#e3e6ea',
        fontSize: '13px'
      }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <i className="fas fa-language text-primary me-2" style={{ fontSize: '16px' }}></i>
            <span className="fw-medium">Google Translate</span>
          </div>
          <button 
            className="btn btn-sm p-1" 
            onClick={() => setIsVisible(false)}
            style={{ 
              border: 'none', 
              background: 'transparent',
              lineHeight: 1
            }}
          >
            <i className="fas fa-times" style={{ fontSize: '12px', color: '#5f6368' }}></i>
          </button>
        </div>
        
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary btn-sm dropdown-toggle px-2 py-1" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{ fontSize: '12px' }}
            >
              {getLanguageName(sourceLanguage)}
            </button>
            <ul className="dropdown-menu">
              {languageOptions.filter(lang => lang.code !== targetLanguage).map(lang => (
                <li key={lang.code}>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setSourceLanguage(lang.code)}
                    style={{ fontSize: '12px' }}
                  >
                    {lang.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <i className="fas fa-arrow-right mx-2 text-muted"></i>
          
          <div className="dropdown">
            <button 
              className="btn btn-primary btn-sm dropdown-toggle px-2 py-1" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{ 
                fontSize: '12px',
                backgroundColor: '#1a73e8',
                borderColor: '#1a73e8'
              }}
            >
              {getLanguageName(targetLanguage)}
            </button>
            <ul className="dropdown-menu">
              {languageOptions.filter(lang => lang.code !== 'auto' && lang.code !== sourceLanguage).map(lang => (
                <li key={lang.code}>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setTargetLanguage(lang.code)}
                    style={{ fontSize: '12px' }}
                  >
                    {lang.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {!isTranslated ? (
            <button 
              className="btn btn-primary btn-sm flex-fill"
              onClick={translatePage}
              disabled={isTranslating}
              style={{ 
                fontSize: '12px',
                backgroundColor: '#1a73e8',
                borderColor: '#1a73e8'
              }}
            >
              {isTranslating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Translating...
                </>
              ) : (
                <>
                  <i className="fas fa-language me-1"></i>
                  Translate this page
                </>
              )}
            </button>
          ) : (
            <button 
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={revertTranslation}
              style={{ 
                fontSize: '12px',
                borderColor: '#1a73e8',
                color: '#1a73e8'
              }}
            >
              <i className="fas fa-undo me-1"></i>
              Show original
            </button>
          )}
          
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary btn-sm" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{ fontSize: '12px' }}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" style={{ fontSize: '12px' }}>
                  <i className="fas fa-sync me-2"></i>
                  Always translate from {getLanguageName(sourceLanguage)}
                </button>
              </li>
              <li>
                <button className="dropdown-item" style={{ fontSize: '12px' }}>
                  <i className="fas fa-ban me-2"></i>
                  Never translate this site
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" style={{ fontSize: '12px' }}>
                  <i className="fas fa-cog me-2"></i>
                  Translation settings
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleTranslate;