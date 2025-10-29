// proxy /api/tip -> backend:3001/api/tip

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:3001/api/tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('proxy error:', error);
    return Response.json({ error: 'internal server error' }, { status: 500 });
  }
}
