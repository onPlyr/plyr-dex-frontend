import { NextRequest, NextResponse } from 'next/server';

// Constants
const PRICES_SERVICE_URL = process.env.PRICES_SERVICE_URL;
if (!PRICES_SERVICE_URL) {
  throw new Error('PRICES_SERVICE_URL environment variable is not set');
}
const PRICES_SERVICE_API_KEY = process.env.PRICES_SERVICE_API_KEY || '';

// Import only what we need for error handling
import { ErrorCode } from '@/app/lib/prices/types';
import { formatErrorResponse } from '@/app/lib/prices/utils/formatting';

// Configure route segment
export const dynamic = 'auto'; // Allow Next.js to determine if the route is dynamic
export const revalidate = 3; // Cache for 3 seconds
export const fetchCache = 'force-cache'; // Cache fetch requests

/**
 * GET /api/prices
 * 
 * Fetches price data for the specified tokens from the prices microservice
 */
export async function GET(request: NextRequest) {
  try {
    // Get the search params
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Create the URL for the microservice
    const url = `${PRICES_SERVICE_URL}/prices?${searchParams}`;
    
    console.log(`Forwarding request to microservice: ${url}`);
    
    // Forward the request to the microservice
    const response = await fetch(url, {
      headers: {
        // Forward auth headers if needed
        'Authorization': request.headers.get('Authorization') || '',
        // Include internal API key for service-to-service auth
        'X-Internal-Key': PRICES_SERVICE_API_KEY,
        // Add original client IP for rate limiting purposes
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
        'X-Request-ID': request.headers.get('X-Request-ID') || crypto.randomUUID(),
        // Forward cache control preferences
        'Cache-Control': request.headers.get('Cache-Control') || '',
      },
      // Use Next.js's built-in fetch cache
      next: {
        revalidate: 3 // Cache for 3 seconds
      }
    });
    
    // Get the response data
    const data = await response.json();
    
    // Forward the response to the client with original cache headers
    const headers = new Headers();
    
    // Forward all cache-related headers
    ['Cache-Control', 'ETag', 'Last-Modified'].forEach(header => {
      const value = response.headers.get(header);
      if (value) headers.set(header, value);
    });
    
    return NextResponse.json(data, { 
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Error forwarding to microservice:', error);
    
    // Return a fallback error response
    return NextResponse.json(
      formatErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Failed to communicate with the prices service'
      ),
      { status: 503 }
    );
  }
}

/**
 * OPTIONS /api/prices
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 