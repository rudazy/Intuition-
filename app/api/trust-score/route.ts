import { NextRequest, NextResponse } from 'next/server';
import { intuitionClient } from '@/lib/intuition/client';

/**
 * GET /api/trust-score
 *
 * Get trust score for an Ethereum address
 *
 * Query parameters:
 * - address: Ethereum address (0x...)
 *
 * Example: /api/trust-score?address=0x1234567890123456789012345678901234567890
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Fetch trust score from Intuition
    const trustScore = await intuitionClient.getTrustScore(address);

    return NextResponse.json({
      success: true,
      data: trustScore,
    });
  } catch (error) {
    console.error('Error fetching trust score:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trust score',
      },
      { status: 500 }
    );
  }
}
