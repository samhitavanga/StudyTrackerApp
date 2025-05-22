import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/authOptions';

// Helper function to handle user data and fetch grades
async function handleUserData(userData: any, strapiUrl: string, authHeader: Record<string, string>) {
  try {
    const userId = userData.id;
    console.log('Found user ID:', userId);

    // Fetch the daily grades from Strapi
    console.log('Fetching grades for user ID:', userId);
    const gradesResponse = await fetch(`${strapiUrl}/api/daily-grades?filters[user][id]=${userId}&sort=date:desc&populate=*`, {
      headers: authHeader
    });

    if (!gradesResponse.ok) {
      console.error('Failed to fetch grades from Strapi:', gradesResponse.status);
      const error = await gradesResponse.json();
      console.error('Strapi error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch grades from the database' },
        { status: 500 }
      );
    }

    const gradesData = await gradesResponse.json();
    console.log('Grades data from Strapi:', gradesData);

    // Check if the data structure is as expected
    if (!gradesData.data || !Array.isArray(gradesData.data)) {
      console.error('Unexpected data structure from Strapi:', gradesData);
      return NextResponse.json(
        { error: 'Unexpected data format from the database' },
        { status: 500 }
      );
    }

    // Transform the data to match our frontend format
    const formattedData = gradesData.data.map((item: any) => ({
      date: item.attributes.date,
      entries: Array.isArray(item.attributes.entries) 
        ? item.attributes.entries.map((entry: any) => ({
            subject: entry.subject,
            grade: entry.grade,
            attendance: entry.attendance,
          }))
        : [],
      id: item.id,
    }));

    console.log('Formatted grades data for frontend:', formattedData);
    
    // Store in localStorage as a fallback for offline use
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyGrades', JSON.stringify(formattedData));
      console.log('Saved grades to localStorage for offline use');
    }

    return NextResponse.json({
      data: formattedData,
      source: 'strapi'
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to process grades data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get the session to identify the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.error('No authenticated session found');
      return NextResponse.json(
        { error: 'You must be logged in to view grades' },
        { status: 401 }
      );
    }

    // Get the user from Strapi based on email
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    console.log('Fetching user from Strapi for email:', session.user.email);
    
    // Use the JWT token from the session if available
    const authHeader = session.jwt 
      ? { 'Authorization': `Bearer ${session.jwt}` }
      : { 'Authorization': '' };
    
    console.log('Using auth header:', authHeader);
    
    try {
      // First try to get the current user using the /api/users/me endpoint
      const meResponse = await fetch(`${strapiUrl}/api/users/me`, {
        headers: authHeader
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log('Retrieved user data from /me endpoint:', userData.id);
        return await handleUserData(userData, strapiUrl, authHeader);
      }
      
      console.log('Failed to get user from /me endpoint, trying to find by email');
      
      // Fallback to the users endpoint with email filter
      const userResponse = await fetch(`${strapiUrl}/api/users?filters[email]=${encodeURIComponent(session.user.email)}`, {
        headers: authHeader
      });

      if (!userResponse.ok) {
        console.error('Failed to fetch user from Strapi:', userResponse.status);
        const errorData = await userResponse.json();
        console.error('Strapi error response:', errorData);
        
        // Use localStorage as fallback if API is not available
        if (typeof window !== 'undefined') {
          console.log('Trying to get data from localStorage');
          const localData = localStorage.getItem('dailyGrades');
          if (localData) {
            const parsedData = JSON.parse(localData);
            console.log('Found data in localStorage:', parsedData);
            return NextResponse.json({
              data: parsedData,
              source: 'localStorage'
            });
          }
        }
        
        return NextResponse.json(
          { error: 'Failed to authenticate with the database' },
          { status: 401 }
        );
      }
      
      const responseData = await userResponse.json();
      
      if (!responseData.data || responseData.data.length === 0) {
        return NextResponse.json(
          { error: 'User not found in the system' },
          { status: 404 }
        );
      }
      
      return await handleUserData(responseData.data[0], strapiUrl, authHeader);
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { error: 'Failed to get user data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the session to identify the user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to submit grades' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, entries } = body;

    // Validate input
    if (!date || !entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate each entry
    for (const entry of entries) {
      if (!entry.subject || entry.grade === undefined || entry.attended === undefined) {
        return NextResponse.json(
          { error: 'Each entry must have subject, grade, and attendance status' },
          { status: 400 }
        );
      }
    }

    // Get the user from Strapi based on email
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    const apiToken = process.env.STRAPI_API_TOKEN;
    
    if (!strapiUrl || !apiToken) {
      console.error('Missing Strapi configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use the JWT token from the session if available
    const authHeader = session.jwt 
      ? { 'Authorization': `Bearer ${session.jwt}` }
      : { 'Authorization': `Bearer ${apiToken}` };

    const userResponse = await fetch(`${strapiUrl}/api/users?filters[email]=${encodeURIComponent(session.user.email)}`, {
      headers: authHeader
    });

    const userData = await userResponse.json();
    
    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json(
        { error: 'User not found in the system' },
        { status: 404 }
      );
    }

    const userId = userData.data[0].id;

    // Submit the daily grade to Strapi
    const gradeResponse = await fetch(`${strapiUrl}/api/daily-grades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({
        data: {
          date,
          user: userId,
          entries,
          publishedAt: new Date().toISOString()
        }
      })
    });

    if (!gradeResponse.ok) {
      const error = await gradeResponse.json();
      console.error('Strapi error:', error);
      return NextResponse.json(
        { error: 'Failed to save grades to the database' },
        { status: 500 }
      );
    }

    const gradeData = await gradeResponse.json();

    // Return success response
    return NextResponse.json(
      { success: true, data: gradeData.data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Daily grades submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
