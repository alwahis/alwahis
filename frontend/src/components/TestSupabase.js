import React, { useEffect, useState } from 'react';
import { ridesService } from '../services/ridesService';

function TestSupabase() {
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTest() {
      try {
        const { data, error } = await ridesService.testConnection();
        if (error) {
          console.error('Test failed:', error);
          setError(error);
        } else {
          console.log('Test succeeded:', data);
          setTestResult(data);
        }
      } catch (err) {
        console.error('Test error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    runTest();
  }, []);

  if (loading) {
    return <div>Testing Supabase connection...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <h3>Test Failed</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      <h3>Test Succeeded</h3>
      <h4>Created Ride:</h4>
      <pre>{JSON.stringify(testResult?.created, null, 2)}</pre>
      <h4>Search Results:</h4>
      <pre>{JSON.stringify(testResult?.searched, null, 2)}</pre>
    </div>
  );
}

export default TestSupabase;
