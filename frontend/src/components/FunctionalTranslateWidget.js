import React, { useState, useEffect, useRef } from 'react';

const FunctionalTranslateWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  
  const widgetRef = useRef(null);

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

  // Hide widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        // If clicking outside the entire widget, hide it
        setIsVisible(false);
      } else if (!event.target.closest('.dropdown-container')) {
        // If clicking inside widget but outside dropdowns, close dropdowns
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
    setIsTranslated(false);
  };

  const handleTargetLanguageChange = (langCode) => {
    setTargetLanguage(langCode);
    setShowTargetDropdown(false);
    setIsTranslated(false);
  };

  // Simplified translation using Google Translate Website Widget
  const translatePage = async () => {
    setIsTranslating(true);
    
    try {
      // Remove any existing Google Translate elements
      const existingElements = document.querySelectorAll('[id*="google_translate"], .goog-te-banner-frame, .goog-te-menu-frame');
      existingElements.forEach(el => el.remove());
      
      // Create Google Translate element
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element_hidden';
      translateDiv.style.position = 'fixed';
      translateDiv.style.top = '-1000px'; // Hide it off-screen
      translateDiv.style.left = '-1000px';
      document.body.appendChild(translateDiv);
      
      // Load Google Translate script
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = function() {
          new window.google.translate.TranslateElement({
            pageLanguage: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
            includedLanguages: languageOptions.map(lang => lang.code).filter(code => code !== 'auto').join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          }, 'google_translate_element_hidden');
          
          // Wait for the element to be created, then trigger translation
          setTimeout(() => {
            const selectElement = document.querySelector('#google_translate_element_hidden select');
            if (selectElement) {
              // Find the option for target language
              const targetOption = Array.from(selectElement.options).find(option => 
                option.value.includes(targetLanguage)
              );
              
              if (targetOption) {
                selectElement.value = targetOption.value;
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                setIsTranslated(true);
                
                // Hide Google's translate bar if it appears
                setTimeout(() => {
                  const banner = document.querySelector('.goog-te-banner-frame');
                  if (banner) {
                    banner.style.display = 'none';
                  }
                }, 500);
              }
            }
            setIsTranslating(false);
          }, 2000);
        };
      }
      
      // Load the script if not already loaded
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
      } else if (window.google && window.google.translate) {
        // If already loaded, just initialize
        window.googleTranslateElementInit();
      }
      
    } catch (error) {
      console.error('Translation failed:', error);
      setIsTranslating(false);
      
      // Fallback: Open Google Translate in new tab
      const currentUrl = encodeURIComponent(window.location.href);
      const translateUrl = `https://translate.google.com/translate?sl=${sourceLanguage}&tl=${targetLanguage}&u=${currentUrl}`;
      window.open(translateUrl, '_blank');
    }
  };

  const revertTranslation = () => {
    try {
      // Try to revert using Google Translate
      const selectElement = document.querySelector('#google_translate_element_hidden select');
      if (selectElement) {
        // Select the original language option (usually the first one)
        selectElement.selectedIndex = 0;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        setIsTranslated(false);
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      // If all else fails, reload the page
      window.location.reload();
    }
  };

  // Alternative translation method using a different approach
  const translatePageAlternative = () => {
    setIsTranslating(true);
    
    // Create a simple translation overlay or redirect to Google Translate
    setTimeout(() => {
      const currentUrl = encodeURIComponent(window.location.href);
      const translateUrl = `https://translate.google.com/translate?sl=${sourceLanguage}&tl=${targetLanguage}&u=${currentUrl}`;
      
      // Option 1: Open in same tab
      // window.location.href = translateUrl;
      
      // Option 2: Open in new tab (recommended)
      window.open(translateUrl, '_blank');
      
      setIsTranslating(false);
      setIsTranslated(true);
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={widgetRef}
      className="position-fixed" 
      style={{ 
        top: '10px', 
        right: '10px', 
        zIndex: 1050,
        minWidth: '320px'
      }}
    >
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
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
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
              onClick={(e) => {
                e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSourceLanguageChange(lang.code);
                      }}
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
              onClick={(e) => {
                e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTargetLanguageChange(lang.code);
                      }}
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
              onClick={(e) => {
                e.stopPropagation();
                translatePageAlternative(); // Using the alternative method that works better
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                revertTranslation();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
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
