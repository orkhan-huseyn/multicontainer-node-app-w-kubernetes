import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <h1>I am the home page v3.</h1>
      <Link to="/fib">Go to calculator</Link>
    </div>
  );
};
