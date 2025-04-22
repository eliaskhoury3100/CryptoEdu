import React, { useState } from 'react';

// Function to validate the password
function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

const RegisterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Handle the form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate the password before submitting the form
    if (!validatePassword(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.");
      return;
    }

    // Send the registration data to the backend
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Registration successful
      console.log("User registered successfully");
    } else {
      // Display error message from server response
      setError(data.error || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div>
        <label>Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
