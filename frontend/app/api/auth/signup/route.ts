import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    console.log('Signup request received for email:', email);

    // Validate input
    if (!email || !password) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if Strapi URL is configured
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    console.log('Using Strapi URL for registration:', strapiUrl);
    
    if (!strapiUrl) {
      console.error('NEXT_PUBLIC_STRAPI_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate username from email if not provided
    const generatedUsername = username || email.split('@')[0];
    console.log('Using username for registration:', generatedUsername);

    // Create the request body with all required fields
    const requestBody = {
      username: generatedUsername,
      email,
      password,
    };
    console.log('Registration request body (sanitized):', { ...requestBody, password: '[REDACTED]' });

    // Register user in Strapi
    const registerResponse = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      console.error('Strapi registration error:', registerData);
      
      // Handle specific error messages from Strapi
      if (registerData.error?.message) {
        return NextResponse.json(
          { error: registerData.error.message },
          { status: registerResponse.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: registerResponse.status }
      );
    }

    // Return success response with user data (excluding sensitive info)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: registerData.user.id,
          username: registerData.user.username,
          email: registerData.user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
