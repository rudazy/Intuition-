import { GraphQLClient } from 'graphql-request';
import type { 
  Attestation, 
  AttestationFilters, 
  TrustScore, 
  VerificationResult, 
  Expert,
  GraphQLResponse 
} from './types';

export class IntuitionClient {
  private client: GraphQLClient;
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_INTUITION_GRAPH_URL || 'https://graph.intuition.systems/graphql';
    this.client = new GraphQLClient(this.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Query attestations from Intuition graph with filters
   */
  async getAttestations(filters: AttestationFilters = {}): Promise<Attestation[]> {
    const query = `
      query GetTriples(
        $creator: String
        $subject: String
        $predicate: String
        $object: String
        $limit: Int
        $offset: Int
      ) {
        triples(
          where: {
            creator: $creator
            subject: $subject
            predicate: $predicate
            object: $object
          }
          first: $limit
          skip: $offset
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          creator
          subject
          predicate
          object
          blockTimestamp
          vaultId
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query, {
        creator: filters.creator,
        subject: filters.subject,
        predicate: filters.predicate,
        object: filters.object,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });

      // Transform to our Attestation type
      return (data.triples || []).map(triple => ({
        id: triple.id,
        creator: triple.creator,
        subject: triple.subject,
        predicate: triple.predicate,
        object: triple.object,
        timestamp: triple.blockTimestamp,
        confidence: 0.8, // Default confidence
        stake: triple.vaultId,
        metadata: {}
      }));
    } catch (error) {
      console.error('Error fetching attestations:', error);
      throw new Error(`Failed to fetch attestations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate trust score for an address based on attestations
   */
  async getTrustScore(address: string): Promise<TrustScore> {
    // Get all attestations where address is the subject
    const attestations = await this.getAttestations({ 
      subject: address.toLowerCase(),
      limit: 1000 
    });

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

    // Calculate trust metrics
    const positiveAttestations = attestations.filter(a => 
      a.confidence > 0.7
    );

    const negativeAttestations = attestations.filter(a => 
      a.confidence < 0.3
    );

    // Calculate weighted score
    const weightedScore = attestations.reduce((sum, a) => {
      return sum + a.confidence;
    }, 0) / attestations.length;

    // Calculate breakdown scores based on predicate types
    const credibilityAttestations = attestations.filter(a => 
      a.predicate.toLowerCase().includes('credib')
    );
    const expertiseAttestations = attestations.filter(a => 
      a.predicate.toLowerCase().includes('expert') || 
      a.predicate.toLowerCase().includes('skill')
    );
    const reliabilityAttestations = attestations.filter(a => 
      a.predicate.toLowerCase().includes('reliab')
    );

    const calculateAverage = (arr: Attestation[]) => 
      arr.length > 0 ? arr.reduce((sum, a) => sum + a.confidence, 0) / arr.length : 0;

    return {
      address,
      score: Math.min(Math.max(weightedScore * 100, 0), 100),
      attestationCount: attestations.length,
      positiveAttestations: positiveAttestations.length,
      negativeAttestations: negativeAttestations.length,
      lastUpdated: Date.now(),
      breakdown: {
        credibility: calculateAverage(credibilityAttestations) * 100,
        expertise: calculateAverage(expertiseAttestations) * 100,
        reliability: calculateAverage(reliabilityAttestations) * 100,
        reputation: weightedScore * 100
      }
    };
  }

  /**
   * Verify if an address has a specific credential/claim
   */
  async verifyCredential(address: string, claim: string): Promise<VerificationResult> {
    const attestations = await this.getAttestations({
      subject: address.toLowerCase(),
      predicate: claim.toLowerCase(),
      limit: 50
    });

    const verified = attestations.length > 0;
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
  }

  /**
   * Find trusted experts in a specific topic/domain
   */
  async findTrustedExperts(topic: string, limit: number = 10): Promise<Expert[]> {
    // Get attestations related to the topic
    const attestations = await this.getAttestations({
      predicate: topic.toLowerCase(),
      limit: 500
    });

    // Group by subject (the expert addresses)
    const expertMap = new Map<string, Attestation[]>();
    attestations.forEach(att => {
      const existing = expertMap.get(att.subject) || [];
      expertMap.set(att.subject, [...existing, att]);
    });

    // Calculate scores for each expert
    const experts: Expert[] = [];
    for (const [address, atts] of expertMap.entries()) {
      const trustScore = await this.getTrustScore(address);
      experts.push({
        address,
        trustScore: trustScore.score,
        attestationCount: atts.length,
        specializations: [topic],
        recentActivity: Math.max(...atts.map(a => a.timestamp))
      });
    }

    // Sort by trust score and return top experts
    return experts
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, limit);
  }
}

// Export singleton instance
export const intuitionClient = new IntuitionClient();