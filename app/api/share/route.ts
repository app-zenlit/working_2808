import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string || '';
    const text = formData.get('text') as string || '';
    const url = formData.get('url') as string || '';
    const files = formData.getAll('files') as File[];
    
    // Process shared content
    const sharedData = {
      title,
      text,
      url,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };
    
    console.log('Received shared content:', sharedData);
    
    // Redirect to create post page with shared content
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('tab', 'create');
    redirectUrl.searchParams.set('shared', 'true');
    
    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('Share target error:', error);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}