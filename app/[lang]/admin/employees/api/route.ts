import { NextResponse } from 'next/server';
import { CreateEmployee } from '@/domain/use-case/admin/createEmployee';
import { GetAllEmployees } from '@/domain/use-case/admin/getAllEmployees';

// GET /admin/employees/api - Get all employees
export async function GET() {
    try {
        const employees = await new GetAllEmployees().execute();
        return NextResponse.json({ success: true, data: employees });
    } catch (err: any) {
        console.error('[GET employees] error', err);
        return NextResponse.json(
            { success: false, error: err?.message || String(err) },
            { status: 500 }
        );
    }
}

// POST /admin/employees/api - Create new employee
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields
        const { email, name, role, password, autoGeneratePassword, phone, permissions } = body;

        if (!email || !name || !role) {
            return NextResponse.json(
                { success: false, error: 'Email, name, and role are required' },
                { status: 400 }
            );
        }

        // Create employee
        const result = await new CreateEmployee().execute({
            email,
            name,
            role,
            password,
            autoGeneratePassword: autoGeneratePassword ?? !password,
            phone,
            permissions,
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: result.generatedPassword
                ? `Employee created. Generated password: ${result.generatedPassword}`
                : 'Employee created successfully'
        });
    } catch (err: any) {
        console.error('[POST employee] error', err);

        // Handle specific errors
        if (err?.message?.includes('already registered') || err?.message?.includes('duplicate key') || err?.message?.includes('already exists')) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: err?.message || String(err) },
            { status: 500 }
        );
    }
}
