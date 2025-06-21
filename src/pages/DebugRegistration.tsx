import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const DebugRegistration: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testRegistration = async () => {
    try {
      console.log('Testing registration...');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: 'debug-test@example.com', 
          password: 'test123' 
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(`Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Registration</h1>
      <Button onClick={testRegistration}>Test Registration</Button>
      <pre style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px' }}>
        {result}
      </pre>
    </div>
  );
};

export default DebugRegistration;
