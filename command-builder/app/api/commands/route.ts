// app/api/commands/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path is relative to project root
    const filePath = path.join(process.cwd(), 'data', 'commands.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading commands file:', error);

    // If file doesn't exist, return empty structure
    return NextResponse.json({ commands: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'commands.json');

    // Ensure the data has the right structure
    if (!data.commands || !Array.isArray(data.commands)) {
      return NextResponse.json(
        { error: 'Invalid command structure' },
        { status: 400 }
      );
    }

    // Pretty print the JSON for better readability
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving commands:', error);

    return NextResponse.json(
      { error: 'Failed to save commands' },
      { status: 500 }
    );
  }
}