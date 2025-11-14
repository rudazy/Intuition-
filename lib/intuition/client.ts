import { GraphQLClient } from 'graphql-request';
import type {
  Attestation,
  AttestationFilters,
  TrustScore,
  VerificationResult,
  Expert
} from './types';

export class IntuitionClient {
  private client: GraphQLClient;
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_INTUITION_GRAPH_URL || 'https://testnet.intuition.sh/v1/graphql';
    this.client = new GraphQLClient(this.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Query attestations (triples) from Intuition graph with filters
   */
  async getAttestations(filters: AttestationFilters = {}): Promise<Attestation[]> {
    // Build where clause
    const whereConditions: any = {};

    if (filters.creator) {
      whereConditions.creator_id = { _eq: filters.creator };
    }

    if (filters.subject) {
      whereConditions.subject = {
        wallet_id: { _ilike: `%${filters.subject}%` }
      };
    }

    if (filters.predicate) {
      whereConditions.predicate = {
        _or: [
          { label: { _ilike: `%${filters.predicate}%` } },
          { data: { _ilike: `%${filters.predicate}%` } }
        ]
      };
    }

    if (filters.object) {
      whereConditions.object = {
        _or: [
          { label: { _ilike: `%${filters.object}%` } },
          { data: { _ilike: `%${filters.object}%` } }
        ]
      };
    }

    const query = `
      query GetTriples($where: triples_bool_exp, $limit: Int, $offset: Int) {
        triples(
          where: $where
          limit: $limit
          offset: $offset
          order_by: { created_at: desc }
        ) {
          term_id
          creator_id
          subject_id
          predicate_id
          object_id
          created_at
          block_number
          transaction_hash
          creator {
            id
            label
          }
          subject {
            wallet_id
            label
            data
          }
          predicate {
            wallet_id
            label
            data
          }
          object {
            wallet_id
            label
            data
          }
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query, {
        where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });

      // Transform to our Attestation type
      return (data.triples || []).map(triple => {
        const timestamp = new Date(triple.created_at).getTime() / 1000;

        return {
          id: triple.term_id,
          creator: triple.creator_id,
          subject: triple.subject?.wallet_id || triple.subject?.label || '',
          predicate: triple.predicate?.label || triple.predicate?.data || '',
          object: triple.object?.label || triple.object?.wallet_id || triple.object?.data || '',
          timestamp: timestamp,
          confidence: 0.85, // Default confidence - could be calculated from vault data
          stake: triple.term_id, // Using term_id as stake reference
          metadata: {
            subject_label: triple.subject?.label,
            predicate_label: triple.predicate?.label,
            object_label: triple.object?.label,
            block_number: triple.block_number,
            transaction_hash: triple.transaction_hash
          }
        };
      });
    } catch (error) {
      console.error('Error fetching attestations:', error);
      throw new Error(`Failed to fetch attestations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate trust score for an Ethereum address based on attestations
   */
  async getTrustScore(address: string): Promise<TrustScore> {
    // Normalize address
    const normalizedAddress = address.toLowerCase();

    // Query for attestations where the address is the subject
    const query = `
      query GetAddressTrustScore($address: String!) {
        triples(
          where: {
            subject: {
              wallet_id: { _ilike: $address }
            }
          }
          limit: 1000
          order_by: { created_at: desc }
        ) {
          term_id
          creator_id
          created_at
          predicate {
            label
            data
          }
          object {
            label
            data
          }
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query, {
        address: `%${normalizedAddress}%`
      });

      const attestations = data.triples || [];

      if (attestations.length === 0) {
        return {
          address,
          score: 0,
          attestationCount: 0,
          positiveAttestations: 0,
          negativeAttestations: 0,
          lastUpdated: Date.now(),
          breakdown: {
            credibility: 0,
            expertise: 0,
            reliability: 0,
            reputation: 0
          }
        };
      }

      // Analyze attestation types to calculate scores
      const positiveKeywords = ['expert', 'trusted', 'verified', 'credible', 'reliable'];
      const negativeKeywords = ['scam', 'fraud', 'untrusted', 'suspicious'];

      let positiveCount = 0;
      let negativeCount = 0;
      let credibilitySum = 0;
      let expertiseSum = 0;
      let reliabilitySum = 0;

      attestations.forEach(att => {
        const predicateText = (att.predicate?.label || att.predicate?.data || '').toLowerCase();
        const objectText = (att.object?.label || att.object?.data || '').toLowerCase();
        const combinedText = `${predicateText} ${objectText}`;

        const isPositive = positiveKeywords.some(kw => combinedText.includes(kw));
        const isNegative = negativeKeywords.some(kw => combinedText.includes(kw));

        if (isPositive) positiveCount++;
        if (isNegative) negativeCount++;

        // Calculate breakdown scores based on predicate types
        if (predicateText.includes('credib') || predicateText.includes('trust')) {
          credibilitySum += isPositive ? 1 : (isNegative ? -0.5 : 0.5);
        }
        if (predicateText.includes('expert') || predicateText.includes('skill')) {
          expertiseSum += isPositive ? 1 : (isNegative ? -0.5 : 0.5);
        }
        if (predicateText.includes('reliab') || predicateText.includes('verified')) {
          reliabilitySum += isPositive ? 1 : (isNegative ? -0.5 : 0.5);
        }
      });

      // Calculate overall score
      const totalCount = attestations.length;
      const baseScore = ((positiveCount - negativeCount * 2) / totalCount) * 100;
      const normalizedScore = Math.min(Math.max(baseScore + 50, 0), 100);

      return {
        address,
        score: normalizedScore,
        attestationCount: totalCount,
        positiveAttestations: positiveCount,
        negativeAttestations: negativeCount,
        lastUpdated: Date.now(),
        breakdown: {
          credibility: Math.min(Math.max((credibilitySum / totalCount) * 100 + 50, 0), 100),
          expertise: Math.min(Math.max((expertiseSum / totalCount) * 100 + 50, 0), 100),
          reliability: Math.min(Math.max((reliabilitySum / totalCount) * 100 + 50, 0), 100),
          reputation: normalizedScore
        }
      };
    } catch (error) {
      console.error('Error calculating trust score:', error);
      throw new Error(`Failed to calculate trust score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify if an address has a specific credential/claim
   */
  async verifyCredential(address: string, claim: string): Promise<VerificationResult> {
    const normalizedAddress = address.toLowerCase();
    const normalizedClaim = claim.toLowerCase();

    const query = `
      query VerifyCredential($address: String!, $claim: String!) {
        triples(
          where: {
            subject: {
              wallet_id: { _ilike: $address }
            }
            predicate: {
              _or: [
                { label: { _ilike: $claim } },
                { data: { _ilike: $claim } }
              ]
            }
          }
          limit: 50
          order_by: { created_at: desc }
        ) {
          term_id
          creator_id
          created_at
          subject {
            wallet_id
            label
          }
          predicate {
            label
            data
          }
          object {
            label
            data
          }
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query, {
        address: `%${normalizedAddress}%`,
        claim: `%${normalizedClaim}%`
      });

      const triples = data.triples || [];
      const verified = triples.length > 0;

      // Convert to attestation format
      const attestations: Attestation[] = triples.map(triple => ({
        id: triple.term_id,
        creator: triple.creator_id,
        subject: triple.subject?.wallet_id || '',
        predicate: triple.predicate?.label || triple.predicate?.data || '',
        object: triple.object?.label || triple.object?.data || '',
        timestamp: new Date(triple.created_at).getTime() / 1000,
        confidence: 0.85,
        metadata: {
          subject_label: triple.subject?.label,
          predicate_label: triple.predicate?.label,
          object_label: triple.object?.label
        }
      }));

      const avgConfidence = verified
        ? attestations.reduce((sum, a) => sum + a.confidence, 0) / attestations.length
        : 0;

      return {
        verified,
        attestations,
        confidence: avgConfidence,
        message: verified
          ? `Address ${address} has ${attestations.length} attestation(s) for "${claim}" with ${(avgConfidence * 100).toFixed(1)}% confidence`
          : `No attestations found for "${claim}" on address ${address}`
      };
    } catch (error) {
      console.error('Error verifying credential:', error);
      throw new Error(`Failed to verify credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find trusted experts in a specific topic/domain
   */
  async findTrustedExperts(topic: string, limit: number = 10): Promise<Expert[]> {
    const normalizedTopic = topic.toLowerCase();

    const query = `
      query FindExperts($topic: String!, $limit: Int!) {
        triples(
          where: {
            predicate: {
              _or: [
                { label: { _ilike: $topic } },
                { data: { _ilike: $topic } }
              ]
            }
          }
          limit: 500
          order_by: { created_at: desc }
        ) {
          subject {
            wallet_id
            label
          }
          predicate {
            label
            data
          }
          created_at
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query, {
        topic: `%${normalizedTopic}%`,
        limit: limit * 10 // Get more to process
      });

      const triples = data.triples || [];

      // Group by subject wallet_id
      const expertMap = new Map<string, { count: number; lastActivity: number }>();

      triples.forEach(triple => {
        const walletId = triple.subject?.wallet_id;
        if (!walletId) return;

        const existing = expertMap.get(walletId) || { count: 0, lastActivity: 0 };
        const timestamp = new Date(triple.created_at).getTime();

        expertMap.set(walletId, {
          count: existing.count + 1,
          lastActivity: Math.max(existing.lastActivity, timestamp)
        });
      });

      // Convert to Expert array and sort by attestation count
      const experts: Expert[] = Array.from(expertMap.entries()).map(([address, data]) => ({
        address,
        trustScore: Math.min(50 + data.count * 10, 100), // Simple score based on attestation count
        attestationCount: data.count,
        specializations: [topic],
        recentActivity: data.lastActivity / 1000 // Convert to seconds
      }));

      return experts
        .sort((a, b) => b.attestationCount - a.attestationCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding experts:', error);
      throw new Error(`Failed to find experts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const intuitionClient = new IntuitionClient();
