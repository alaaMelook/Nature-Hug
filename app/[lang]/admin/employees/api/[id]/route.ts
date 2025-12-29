import { NextResponse } from 'next/server';
import { UpdateEmployeePermissions, UpdateEmployeeRole } from '@/domain/use-case/admin/updateEmployee';
import { DeleteEmployee } from '@/domain/use-case/admin/deleteEmployee';

// PUT /admin/employees/api/[id] - Update employee permissions or role
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const memberId = parseInt(id, 10);

        if (isNaN(memberId) || memberId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { permissions, role } = body;

        // Update permissions if provided
        if (permissions) {
            await new UpdateEmployeePermissions().execute(memberId, permissions);
        }

        // Update role if provided
        if (role) {
            await new UpdateEmployeeRole().execute(memberId, role);
        }

        return NextResponse.json({
            success: true,
            message: 'Employee updated successfully'
        });
    } catch (err: any) {
        console.error('[PUT employee] error', err);
        return NextResponse.json(
            { success: false, error: err?.message || String(err) },
            { status: 500 }
        );
    }
}

// DELETE /admin/employees/api/[id] - Delete employee
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const memberId = parseInt(id, 10);

        if (isNaN(memberId) || memberId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid employee ID' },
                { status: 400 }
            );
        }

        await new DeleteEmployee().execute(memberId);

        return NextResponse.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (err: any) {
        console.error('[DELETE employee] error', err);

        if (err?.message?.includes('not found')) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: err?.message || String(err) },
            { status: 500 }
        );
    }
}
