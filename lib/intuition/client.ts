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
   * Query attestations (triples) from Intuition graph
   */
  async getAttestations(filters: AttestationFilters = {}): Promise<Attestation[]> {
    const query = `
      query GetTriples {
        triples(first: 100, orderBy: createdAt, orderDirection: desc) {
          id
          subject {
            id
            uri
          }
          predicate {
            id
            uri
          }
          object {
            id
            uri
          }
          createdAt
          positiveVault {
            id
            totalShares
          }
        }
      }
    `;

    try {
      const data = await this.client.request<{ triples: any[] }>(query);

      // Transform to our Attestation type
      return (data.triples || []).map(triple => ({
        id: triple.id,
        creator: triple.subject?.id || '',
        subject: triple.subject?.uri || '',
        predicate: triple.predicate?.uri || '',
        object: triple.object?.uri || '',
        timestamp: parseInt(triple.createdAt) || Date.now(),
        confidence: 0.8,
        stake: triple.positiveVault?.totalShares || '0',
        metadata: {}
      }));
    } catch (error) {
      console.error('Error fetching attestations:', error);
      throw new Error(`Failed to fetch attestations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate trust score for an address
   */
  async getTrustScore(address: string): Promise<TrustScore> {
    const attestations = await this.getAttestations();
    
    // Filter attestations where address is mentioned
    const relevantAttestations = attestations.filter(a => 
      a.subject.toLowerCase().includes(address.toLowerCase()) ||
      a.creator.toLowerCase().includes(address.toLowerCase())
    );

    if (relevantAttestations.length === 0) {
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

    const positiveAttestations = relevantAttestations.filter(a => a.confidence > 0.7);
    const negativeAttestations = relevantAttestations.filter(a => a.confidence < 0.3);
    const weightedScore = relevantAttestations.reduce((sum, a) => sum + a.confidence, 0) / relevantAttestations.length;

    return {
      address,
      score: Math.min(Math.max(weightedScore * 100, 0), 100),
      attestationCount: relevantAttestations.length,
      positiveAttestations: positiveAttestations.length,
      negativeAttestations: negativeAttestations.length,
      lastUpdated: Date.now(),
      breakdown: {
        credibility: weightedScore * 100,
        expertise: weightedScore * 100,
        reliability: weightedScore * 100,
        reputation: weightedScore * 100
      }
    };
  }

  /**
   * Verify credential
   */
  async verifyCredential(address: string, claim: string): Promise<VerificationResult> {
    const attestations = await this.getAttestations();
    const matching = attestations.filter(a => 
      (a.subject.toLowerCase().includes(address.toLowerCase()) ||
       a.creator.toLowerCase().includes(address.toLowerCase())) &&
      a.predicate.toLowerCase().includes(claim.toLowerCase())
    );

    const verified = matching.length > 0;
    const avgConfidence = verified 
      ? matching.reduce((sum, a) => sum + a.confidence, 0) / matching.length 
      : 0;

    return {
      verified,
      attestations: matching,
      confidence: avgConfidence,
      message: verified 
        ? `Found ${matching.length} attestation(s) for "${claim}"`
        : `No attestations found for "${claim}"`
    };
  }

  /**
   * Find trusted experts
   */
  async findTrustedExperts(topic: string, limit: number = 10): Promise<Expert[]> {
    const attestations = await this.getAttestations();
    const topicAttestations = attestations.filter(a => 
      a.predicate.toLowerCase().includes(topic.toLowerCase())
    );

    const expertMap = new Map<string, Attestation[]>();
    topicAttestations.forEach(att => {
      const existing = expertMap.get(att.subject) || [];
      expertMap.set(att.subject, [...existing, att]);
    });

    const experts: Expert[] = [];
    for (const [address, atts] of expertMap.entries()) {
      experts.push({
        address,
        trustScore: 80, // Default score
        attestationCount: atts.length,
        specializations: [topic],
        recentActivity: Math.max(...atts.map(a => a.timestamp))
      });
    }

    return experts
      .sort((a, b) => b.attestationCount - a.attestationCount)
      .slice(0, limit);
  }
}

export const intuitionClient = new IntuitionClient();