import React, { useState, useEffect } from 'react';

const FunctionalTranslateWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowSourceDropdown(false);
        setShowTargetDropdown(false);
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSourceLanguageChange = (langCode) => {
    setSourceLanguage(langCode);
    setShowSourceDropdown(false);
    setIsTranslated(false); // Reset translation state
  };

  const handleTargetLanguageChange = (langCode) => {
    setTargetLanguage(langCode);
    setShowTargetDropdown(false);
    setIsTranslated(false); // Reset translation state
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

  const translatePage = async () => {
    setIsTranslating(true);
    
    try {
      // Add Google Translate script if not already present
      if (!window.google || !window.google.translate) {
        await loadGoogleTranslateScript();
      }
      
      // Initialize Google Translate
      if (window.google && window.google.translate) {
        // Remove existing translate element
        const existingElement = document.getElementById('hidden-google-translate');
        if (existingElement) {
          existingElement.remove();
        }
        
        // Create a new hidden translate element
        const translateElement = document.createElement('div');
        translateElement.id = 'hidden-google-translate';
        translateElement.style.display = 'none';
        document.body.appendChild(translateElement);
        
        new window.google.translate.TranslateElement({
          pageLanguage: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
          includedLanguages: languageOptions.map(lang => lang.code).filter(code => code !== 'auto').join(','),
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
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const revertTranslation = () => {
    // Try to revert using Google Translate
    const selectElement = document.querySelector('#hidden-google-translate select');
    if (selectElement) {
      selectElement.value = '';
      selectElement.dispatchEvent(new Event('change'));
      setIsTranslated(false);
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
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
          {/* Source Language Dropdown */}
          <div className="dropdown-container position-relative">
            <button 
              className="btn btn-outline-secondary btn-sm dropdown-toggle px-2 py-1" 
              type="button" 
              onClick={() => {
                setShowSourceDropdown(!showSourceDropdown);
                setShowTargetDropdown(false);
                setShowOptionsDropdown(false);
              }}
              style={{ fontSize: '12px', minWidth: '120px' }}
            >
              {getLanguageName(sourceLanguage)}
            </button>
            {showSourceDropdown && (
              <ul className="dropdown-menu show position-absolute" style={{ 
                top: '100%', 
                left: 0, 
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {languageOptions.filter(lang => lang.code !== targetLanguage).map(lang => (
                  <li key={lang.code}>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleSourceLanguageChange(lang.code)}
                      style={{ fontSize: '12px' }}
                    >
                      {lang.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <i className="fas fa-arrow-right mx-2 text-muted"></i>
          
          {/* Target Language Dropdown */}
          <div className="dropdown-container position-relative">
            <button 
              className="btn btn-primary btn-sm dropdown-toggle px-2 py-1" 
              type="button" 
              onClick={() => {
                setShowTargetDropdown(!showTargetDropdown);
                setShowSourceDropdown(false);
                setShowOptionsDropdown(false);
              }}
              style={{ 
                fontSize: '12px',
                backgroundColor: '#1a73e8',
                borderColor: '#1a73e8',
                minWidth: '100px'
              }}
            >
              {getLanguageName(targetLanguage)}
            </button>
            {showTargetDropdown && (
              <ul className="dropdown-menu show position-absolute" style={{ 
                top: '100%', 
                right: 0, 
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {languageOptions.filter(lang => lang.code !== 'auto' && lang.code !== sourceLanguage).map(lang => (
                  <li key={lang.code}>
                    <button 
                      className="dropdown-item" 
                      onClick={() => handleTargetLanguageChange(lang.code)}
                      style={{ fontSize: '12px' }}
                    >
                      {lang.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
          
          {/* Options Dropdown */}
          <div className="dropdown-container position-relative">
            <button 
              className="btn btn-outline-secondary btn-sm" 
              type="button" 
              onClick={() => {
                setShowOptionsDropdown(!showOptionsDropdown);
                setShowSourceDropdown(false);
                setShowTargetDropdown(false);
              }}
              style={{ fontSize: '12px' }}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            {showOptionsDropdown && (
              <ul className="dropdown-menu dropdown-menu-end show position-absolute" style={{ 
                top: '100%', 
                right: 0, 
                zIndex: 1000 
              }}>
                <li>
                  <button 
                    className="dropdown-item" 
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      alert(`Always translate from ${getLanguageName(sourceLanguage)} - Feature coming soon!`);
                      setShowOptionsDropdown(false);
                    }}
                  >
                    <i className="fas fa-sync me-2"></i>
                    Always translate from {getLanguageName(sourceLanguage)}
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      alert('Never translate this site - Feature coming soon!');
                      setShowOptionsDropdown(false);
                    }}
                  >
                    <i className="fas fa-ban me-2"></i>
                    Never translate this site
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      alert('Translation settings - Feature coming soon!');
                      setShowOptionsDropdown(false);
                    }}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Translation settings
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalTranslateWidget;
