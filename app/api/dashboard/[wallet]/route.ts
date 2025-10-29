// proxy /api/dashboard/[wallet] -> backend:3001/api/dashboard/[wallet]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    const response = await fetch(`http://localhost:3001/api/dashboard/${wallet}`, {
      method: 'GET',
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('proxy error:', error);
    return Response.json({ error: 'internal server error' }, { status: 500 });
  }
}
