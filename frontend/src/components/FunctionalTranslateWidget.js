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
  const [originalContent, setOriginalContent] = useState(null);
  
  const widgetRef = useRef(null);

  const languageOptions = [
    { code: 'auto', name: 'Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese (Simplified)' },
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

  // Close dropdowns when clicking outside AND hide widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't hide widget if clicking on dropdown items or buttons within the widget
      if (event.target.closest('.dropdown-item') || 
          event.target.closest('.btn') ||
          event.target.closest('.dropdown-menu')) {
        return;
      }

      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        // Hide the entire widget when clicking outside
        setIsVisible(false);
      } else if (!event.target.closest('.dropdown-container')) {
        // Close dropdowns when clicking outside dropdown but inside widget
        setShowSourceDropdown(false);
        setShowTargetDropdown(false);
        setShowOptionsDropdown(false);
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isVisible]);

  const handleSourceLanguageChange = (langCode) => {
    setSourceLanguage(langCode);
    setShowSourceDropdown(false);
    if (isTranslated) {
      setIsTranslated(false);
      revertTranslation();
    }
  };

  const handleTargetLanguageChange = (langCode) => {
    setTargetLanguage(langCode);
    setShowTargetDropdown(false);
    if (isTranslated) {
      setIsTranslated(false);
      revertTranslation();
    }
  };

  // Store original content before translation
  const storeOriginalContent = () => {
    if (!originalContent) {
      const elementsToTranslate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, button, a');
      const contentMap = new Map();
      
      elementsToTranslate.forEach((element, index) => {
        if (element.innerText && element.innerText.trim() && 
            !element.closest('#google_translate_element') && 
            !element.closest('.position-fixed') &&
            element.children.length === 0) {
          contentMap.set(index, {
            element: element,
            originalText: element.innerText
          });
        }
      });
      
      setOriginalContent(contentMap);
    }
  };

  // Simple client-side translation using Google Translate API (free tier)
  const translateText = async (text, targetLang) => {
    try {
      // Using Google Translate's free API endpoint
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translatePage = async () => {
    setIsTranslating(true);
    
    try {
      // Store original content first
      storeOriginalContent();
      
      // Get all text elements that should be translated
      const elementsToTranslate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th, button, a');
      const translationPromises = [];
      
      elementsToTranslate.forEach((element) => {
        // Skip elements that are empty, contain only child elements, or are part of the widget
        if (element.innerText && 
            element.innerText.trim() && 
            !element.closest('.position-fixed') &&
            !element.closest('#google_translate_element') &&
            element.children.length === 0) {
          
          const promise = translateText(element.innerText, targetLanguage)
            .then(translatedText => {
              if (translatedText && translatedText !== element.innerText) {
                element.innerText = translatedText;
              }
            });
          
          translationPromises.push(promise);
        }
      });
      
      // Wait for all translations to complete
      await Promise.all(translationPromises);
      setIsTranslated(true);
      
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed. Please check your internet connection and try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const revertTranslation = () => {
    if (originalContent) {
      originalContent.forEach((data, index) => {
        if (data.element && data.originalText) {
          data.element.innerText = data.originalText;
        }
      });
      setIsTranslated(false);
    }
  };

  // Alternative translation method using Google Translate Widget
  const translatePageWithWidget = async () => {
    setIsTranslating(true);
    
    try {
      // Remove existing Google Translate elements
      const existingElements = document.querySelectorAll('[id^="google_translate"], .goog-te-combo, .skiptranslate');
      existingElements.forEach(el => el.remove());
      
      // Create Google Translate element
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element_hidden';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);
      
      // Load Google Translate script
      if (!window.google || !window.google.translate) {
        await new Promise((resolve, reject) => {
          window.googleTranslateElementInit = resolve;
          const script = document.createElement('script');
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Initialize Google Translate
      new window.google.translate.TranslateElement({
        pageLanguage: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
        includedLanguages: languageOptions.map(lang => lang.code).filter(code => code !== 'auto').join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element_hidden');
      
      // Wait for the select element to be created and trigger translation
      setTimeout(() => {
        const selectElement = document.querySelector('#google_translate_element_hidden select');
        if (selectElement) {
          selectElement.value = targetLanguage;
          selectElement.dispatchEvent(new Event('change'));
          setIsTranslated(true);
        } else {
          // Fallback to manual translation
          translatePage();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Widget translation failed, trying manual translation:', error);
      // Fallback to manual translation
      await translatePage();
    } finally {
      setIsTranslating(false);
    }
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
                translatePageWithWidget();
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
                    onClick={() => {
                      alert(`Will always translate from ${getLanguageName(sourceLanguage)}`);
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
                      alert('Will never translate this site');
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
