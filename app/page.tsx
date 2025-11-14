import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Intuition MCP
          </h1>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost">Docs</Button>
            </Link>
            <Link href="https://github.com" target="_blank">
              <Button variant="outline">GitHub</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Intuition Attestation System
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            A Model Context Protocol (MCP) server for querying trust scores, attestations, and verifying credentials on the Intuition network.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Try Dashboard
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Read Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-blue-600">Trust Scores</CardTitle>
              <CardDescription>
                Get comprehensive trust scores for any Ethereum address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Calculate trust based on attestations with breakdown by credibility, expertise, reliability, and reputation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-600">Query Attestations</CardTitle>
              <CardDescription>
                Search attestations with powerful filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Filter by creator, subject, predicate, object, confidence, timestamps, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-pink-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-pink-600">Verify Credentials</CardTitle>
              <CardDescription>
                Check if addresses have specific claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Verify credentials and claims with confidence scores and supporting attestations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-orange-600">Find Experts</CardTitle>
              <CardDescription>
                Discover trusted experts in any domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Find and rank experts by trust score in specific topics or domains.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">Quick Start</h3>
          <Card>
            <CardHeader>
              <CardTitle>Setup with Claude Desktop</CardTitle>
              <CardDescription>
                Configure the MCP server in your Claude Desktop settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Install Dependencies</h4>
                <code className="block bg-slate-900 text-slate-100 p-4 rounded-md text-sm">
                  npm install
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Configure Claude Desktop</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Add to your Claude Desktop config file:
                </p>
                <code className="block bg-slate-900 text-slate-100 p-4 rounded-md text-sm overflow-x-auto">
                  {`{
  "mcpServers": {
    "intuition": {
      "command": "node",
      "args": ["/path/to/intuition-mcp-server/lib/mcp/server.js"],
      "env": {
        "NEXT_PUBLIC_INTUITION_GRAPH_URL": "https://graph.intuition.systems/graphql"
      }
    }
  }
}`}
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Start Using</h4>
                <p className="text-sm text-slate-600">
                  Restart Claude Desktop and the MCP tools will be available in your conversations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Endpoints Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">API Endpoints</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GET /api/trust-score</CardTitle>
                <CardDescription>Get trust score for an address</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">?address=0x1234567890123456789012345678901234567890</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GET /api/attestations</CardTitle>
                <CardDescription>Query attestations with filters</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm">?subject=0x...&limit=50&predicate=expert</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">POST /api/mcp</CardTitle>
                <CardDescription>Execute MCP tools via HTTP</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-sm block bg-slate-100 p-2 rounded">
                  {`{ "tool": "getTrustScore", "params": { "address": "0x..." } }`}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-slate-50">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p className="mb-2">Built with Next.js, TypeScript, and the Model Context Protocol</p>
          <p className="text-sm">
            <Link href="https://intuition.systems" target="_blank" className="text-blue-600 hover:underline">
              Intuition Systems
            </Link>
            {' • '}
            <Link href="https://modelcontextprotocol.io" target="_blank" className="text-blue-600 hover:underline">
              MCP Docs
            </Link>
            {' • '}
            <Link href="/docs" className="text-blue-600 hover:underline">
              Documentation
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
