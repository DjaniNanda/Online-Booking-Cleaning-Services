import React, { useEffect } from 'react';

const GoogleTranslate = () => {
    useEffect(() => {
        // Function to initialize Google Translate
        const addGoogleTranslateScript = () => {
            if (!window.google || !window.google.translate) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                script.async = true;
                document.head.appendChild(script);
            } else {
                // If Google Translate is already loaded, initialize it
                window.googleTranslateElementInit();
            }
        };

        // Define the initialization function globally
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,es,fr,de,it,pt,zh,ja,ko,ar,hi,ru',
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            }
        };

        // Add the script
        addGoogleTranslateScript();

        // Cleanup function
        return () => {
            // Remove the Google Translate element when component unmounts
            const translateElement = document.getElementById('google_translate_element');
            if (translateElement) {
                translateElement.innerHTML = '';
            }
        };
    }, []);

    return (
        <div 
            id="google_translate_element" 
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                background: 'white',
                padding: '5px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default GoogleTranslate;