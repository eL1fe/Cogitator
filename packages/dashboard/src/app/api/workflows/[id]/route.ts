import { NextResponse } from 'next/server';
import { getWorkflow, updateWorkflow, deleteWorkflow } from '@/lib/cogitator/db';
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (_request, context) => {
  try {
    const { id } = await context!.params!;
    const workflow = await getWorkflow(id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('[api/workflows] Failed to fetch workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request, context) => {
  try {
    const { id } = await context!.params!;
    const body = await request.json();

    const workflow = await updateWorkflow(id, {
      name: body.name,
      description: body.description,
      definition: body.definition,
      initialState: body.initialState,
      triggers: body.triggers,
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('[api/workflows] Failed to update workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (_request, context) => {
  try {
    const { id } = await context!.params!;
    const deleted = await deleteWorkflow(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/workflows] Failed to delete workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
});
