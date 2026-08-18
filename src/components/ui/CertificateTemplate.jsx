import React, { forwardRef } from 'react';
import { Award } from 'lucide-react';

const CertificateTemplate = forwardRef(({ studentName, courseName, date, erpId }, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '1122px',
        height: '794px', // A4 Landscape at 96 DPI
        padding: '40px',
        background: '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        color: '#1f2937',
        fontFamily: 'serif' // Using standard web fonts for PDF generation
      }}
    >
      {/* Outer Border */}
      <div style={{
        border: '15px solid #047857',
        width: '100%',
        height: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative',
        background: '#f8fafc'
      }}>
        {/* Inner Border */}
        <div style={{
          border: '2px solid #047857',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          padding: '40px'
        }}>
          
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Award style={{ width: '80px', height: '80px', color: '#047857' }} />
            <h1 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#047857', letterSpacing: '2px', textTransform: 'uppercase' }}>
              LMS Digital Learning
            </h1>
          </div>

          <h2 style={{ fontSize: '48px', margin: '20px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px' }}>
            Certificate of Completion
          </h2>

          <p style={{ fontSize: '20px', margin: '20px 0', fontStyle: 'italic', color: '#4b5563' }}>
            This is to certify that
          </p>

          <h3 style={{ fontSize: '42px', margin: '10px 0', color: '#111827', borderBottom: '2px solid #d1d5db', paddingBottom: '10px', minWidth: '500px', textAlign: 'center' }}>
            {studentName}
          </h3>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0' }}>
            ERP ID: {erpId}
          </p>

          <p style={{ fontSize: '20px', margin: '30px 0 10px 0', fontStyle: 'italic', color: '#4b5563' }}>
            has successfully completed the course
          </p>

          <h4 style={{ fontSize: '32px', margin: '10px 0', color: '#047857', fontWeight: 'bold', textAlign: 'center' }}>
            {courseName}
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #111827', width: '200px', marginBottom: '10px', fontSize: '20px', paddingBottom: '5px' }}>
                {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <span style={{ fontSize: '18px', color: '#4b5563' }}>Date</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #111827', width: '200px', marginBottom: '10px', height: '30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '5px' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '24px', color: '#047857', fontStyle: 'italic' }}>T. Director</span>
              </div>
              <span style={{ fontSize: '18px', color: '#4b5563' }}>Director of Training</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
