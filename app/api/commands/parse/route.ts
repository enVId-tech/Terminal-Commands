// app/api/commands/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';

export async function POST(request: NextRequest) {
    try {
        const yamlText = await request.text();
        const parsedData = yaml.load(yamlText);

        // Validate the structure
        if (!parsedData || typeof parsedData !== 'object' || !Array.isArray((parsedData as any).commands)) {
            return NextResponse.json(
                { error: 'Invalid YAML format: Missing "commands" array' },
                { status: 400 }
            );
        }

        return NextResponse.json(parsedData);
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return NextResponse.json(
            { error: 'Failed to parse YAML' },
            { status: 400 }
        );
    }
}