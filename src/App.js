import React, { useState, useEffect, useRef } from 'react';

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);
  
  // Form states for different types
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      // Load QRious library dynamically
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      // Fallback to Google Charts API
      generateFallbackQR(text);
    }
  };

  const createQR = (text) => {
    if (!qrContainerRef.current) return;
    
    try {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';
      
      // Create canvas element
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);
      
      // Generate QR code
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 300,
        background: 'white',
        foreground: 'black',
        level: 'M'
      });
      
      // Style the canvas
      canvas.style.width = '100%';
      canvas.style.maxWidth = '300px';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '12px';
      canvas.style.boxShadow = '0 4px 14px -2px rgba(0, 0, 0, 0.1)';
      canvas.style.background = 'white';
      
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text) => {
    if (!qrContainerRef.current) return;
    
    // Clear previous content
    qrContainerRef.current.innerHTML = '';
    
    // Create img element for fallback
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = 'Generated QR Code';
    img.style.width = '100%';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 4px 14px -2px rgba(0, 0, 0, 0.1)';
    img.style.background = 'white';
    img.style.padding = '16px';
    
    // Add error handling for the fallback image
    img.onerror = () => {
      // If Google Charts also fails, try QR Server API
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
    };
    
    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
    return vcard;
  };

  useEffect(() => {
    let data = '';
    
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = '';
    }
    
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;
    
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    
    if (canvas) {
      // Download from canvas
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      // Download from image
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      color: '#374151'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    headerIcon: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
      borderRadius: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '8px'
    },
    headerSubtitle: {
      color: '#6b7280',
      fontSize: '1.125rem'
    },
    mainCard: {
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px 24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      color: '#6b7280'
    },
    tabActive: {
      color: '#7c3aed',
      backgroundColor: '#f3f4f6',
      borderBottom: '2px solid #7c3aed'
    },
    tabHover: {
      color: '#374151',
      backgroundColor: '#f9fafb'
    },
    content: {
      padding: '32px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px'
    },
    gridMobile: {
      gridTemplateColumns: '1fr'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    formInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.2s',
      outline: 'none'
    },
    formInputFocus: {
      borderColor: '#7c3aed',
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
    },
    formTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.2s',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px'
    },
    formHelp: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
      color: 'white',
      boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.3)'
    },
    btnSecondary: {
      background: '#f3f4f6',
      color: '#374151'
    },
    btnClear: {
      width: '100%',
      background: '#f3f4f6',
      color: '#374151'
    },
    qrContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    },
    qrDisplay: {
      background: '#f9fafb',
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px'
    },
    qrPlaceholder: {
      textAlign: 'center',
      padding: '64px 0'
    },
    qrCode: {
      textAlign: 'center'
    },
    qrHelp: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '16px'
    },
    btnGroup: {
      display: 'flex',
      gap: '16px',
      width: '100%',
      maxWidth: '400px'
    },
    btnGroupItem: {
      flex: '1'
    },
    qrData: {
      width: '100%',
      maxWidth: '400px'
    },
    qrDataLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    qrDataContent: {
      background: '#f3f4f6',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      color: '#6b7280',
      maxHeight: '128px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    },
    footer: {
      textAlign: 'center',
      marginTop: '32px',
      color: '#6b7280',
      fontSize: '14px'
    },
    icon: {
      width: '16px',
      height: '16px'
    },
    iconLarge: {
      width: '32px',
      height: '32px',
      color: 'white'
    },
    iconPlaceholder: {
      width: '64px',
      height: '64px',
      color: '#d1d5db',
      marginBottom: '16px'
    },
    iconCheck: {
      color: '#10b981'
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
    { 
      id: 'url', 
      label: 'URL', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      )
    },
    { 
      id: 'text', 
      label: 'Text', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    { 
      id: 'contact', 
      label: 'Contact', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.iconLarge}>
              <rect width="5" height="5" x="3" y="3" rx="1"/>
              <rect width="5" height="5" x="16" y="3" rx="1"/>
              <rect width="5" height="5" x="3" y="16" rx="1"/>
              <path d="m21 16-3.5-3.5-2.5 2.5"/>
              <path d="m21 21-3.5-3.5-2.5 2.5"/>
              <path d="m21 11-3.5-3.5-2.5 2.5"/>
            </svg>
          </div>
          <h1 style={styles.headerTitle}>QR Code Generator</h1>
          <p style={styles.headerSubtitle}>Generate QR codes for URLs, text, and contact information</p>
        </div>

        <div style={styles.mainCard}>
          {/* Tab Navigation */}
          <div style={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {})
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    Object.assign(e.target.style, styles.tabHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = '#6b7280';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div style={styles.content}>
            <div style={{...styles.grid, ...(isMobile ? styles.gridMobile : {})}}>
              {/* Input Section */}
              <div>
                <h2 style={styles.sectionTitle}>
                  {activeTab === 'url' && 'Enter URL'}
                  {activeTab === 'text' && 'Enter Text'}
                  {activeTab === 'contact' && 'Contact Information'}
                </h2>

                {/* URL Input */}
                {activeTab === 'url' && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Website URL</label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="example.com or https://example.com"
                      style={styles.formInput}
                      onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <p style={styles.formHelp}>
                      Enter a website URL. If you don't include http://, we'll add https:// automatically.
                    </p>
                  </div>
                )}

                {/* Text Input */}
                {activeTab === 'text' && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Text Content</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter any text to generate QR code..."
                      rows={4}
                      style={styles.formTextarea}
                      onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Contact Input */}
                {activeTab === 'contact' && (
                  <div>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>First Name</label>
                        <input
                          type="text"
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                          placeholder="John"
                          style={styles.formInput}
                          onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Last Name</label>
                        <input
                          type="text"
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                          placeholder="Doe"
                          style={styles.formInput}
                          onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Phone Number</label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        style={styles.formInput}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                        placeholder="john.doe@example.com"
                        style={styles.formInput}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Organization</label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})}
                        placeholder="Company Name"
                        style={styles.formInput}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Website</label>
                      <input
                        type="url"
                        value={contactInfo.url}
                        onChange={(e) => setContactInfo({...contactInfo, url: e.target.value})}
                        placeholder="https://example.com"
                        style={styles.formInput}
                        onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={resetForm}
                  style={{...styles.btn, ...styles.btnClear}}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Clear All Fields
                </button>
              </div>

              {/* QR Code Display Section */}
              <div style={styles.qrContainer}>
                <h2 style={styles.sectionTitle}>Generated QR Code</h2>
                
                <div style={styles.qrDisplay}>
                  {qrData ? (
                    <div style={styles.qrCode}>
                      <div ref={qrContainerRef}>
                        {/* QR code will be dynamically inserted here */}
                      </div>
                      <p style={styles.qrHelp}>
                        Scan this QR code with your device
                      </p>
                    </div>
                  ) : (
                    <div style={styles.qrPlaceholder}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.iconPlaceholder}>
                        <rect width="5" height="5" x="3" y="3" rx="1"/>
                        <rect width="5" height="5" x="16" y="3" rx="1"/>
                        <rect width="5" height="5" x="3" y="16" rx="1"/>
                        <path d="m21 16-3.5-3.5-2.5 2.5"/>
                        <path d="m21 21-3.5-3.5-2.5 2.5"/>
                        <path d="m21 11-3.5-3.5-2.5 2.5"/>
                      </svg>
                      <p style={{color: '#6b7280'}}>
                        Fill in the form to generate your QR code
                      </p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div style={styles.btnGroup}>
                    <button
                      onClick={downloadQRCode}
                      style={{...styles.btn, ...styles.btnPrimary, ...styles.btnGroupItem}}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #6d28d9, #1d4ed8)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #7c3aed, #2563eb)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                      </svg>
                      Download
                    </button>
                    
                    <button
                      onClick={copyToClipboard}
                      style={{...styles.btn, ...styles.btnSecondary, ...styles.btnGroupItem}}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    >
                      {copied ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{...styles.icon, ...styles.iconCheck}}>
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                          </svg>
                          Copy Data
                        </>
                      )}
                    </button>
                  </div>
                )}

                {qrData && (
                  <div style={styles.qrData}>
                    <h3 style={styles.qrDataLabel}>QR Code Data:</h3>
                    <div style={styles.qrDataContent}>
                      {qrData}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <p>Generate QR codes instantly • No data stored • Free to use</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;