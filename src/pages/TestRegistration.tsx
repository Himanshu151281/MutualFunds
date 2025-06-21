import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const TestRegistration: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');

  const testDirectFetch = async () => {
    setStatus('Testing...');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: `test-${Date.now()}@example.com`, 
          password: 'test123' 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`SUCCESS: ${JSON.stringify(data)}`);
      } else {
        setStatus(`ERROR ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setStatus(`EXCEPTION: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Direct Registration Test</h2>
      <p>Status: {status}</p>
      <Button onClick={testDirectFetch}>Test Direct Fetch</Button>
    </div>
  );
};

export default TestRegistration;
