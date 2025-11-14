# Intuition MCP Server

An MCP (Model Context Protocol) server that enables AI agents like Claude, ChatGPT, and autonomous agents to query trust scores, attestations, and reputation data from Intuition's mainnet.

## 🚀 Features

- **MCP Server Integration**: Connect AI agents directly to Intuition's attestation system
- **Trust Score Calculation**: Aggregate trust scores based on attestation patterns
- **Attestation Queries**: Filter and search attestations with flexible parameters
- **Credential Verification**: Verify if addresses have specific attestations
- **Expert Discovery**: Find highly trusted addresses in specific topics
- **Developer Dashboard**: Interactive API playground and documentation
- **Real-time Data**: Direct connection to Intuition Mainnet

## 🛠️ Tech Stack

- **Next.js 14+** - App Router for API and dashboard
- **TypeScript** - Type safety throughout
- **MCP SDK** - AI agent integration
- **GraphQL** - Intuition API queries
- **Tailwind CSS + shadcn/ui** - Beautiful UI components
- **Vercel** - Deployment ready

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/rudazy/Intuition-.git
cd Intuition-
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` if you need custom configuration (optional - API works without authentication).

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Intuition Mainnet Configuration

- **Chain ID**: 1155
- **RPC URL**: https://rpc.intuition.systems/http
- **Explorer**: https://explorer.intuition.systems
- **GraphQL API**: https://graph.intuition.systems/graphql
- **Currency**: TRUST

## 🤖 MCP Server Usage

### Connect to Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):
```json
{
  "mcpServers": {
    "intuition": {
      "command": "node",
      "args": ["/path/to/Intuition-/lib/mcp/server.js"]
    }
  }
}
```

### Available MCP Tools

1. **getTrustScore(address)** - Get aggregated trust score for an address
2. **getAttestations(address, filters)** - Query attestations with filters
3. **verifyCredential(address, claim)** - Verify if address has specific attestation
4. **findTrustedExperts(topic)** - Find highly trusted addresses in a topic

## 📚 API Endpoints

- `GET /api/trust-score?address=0x...` - Get trust score
- `GET /api/attestations?address=0x...` - Get attestations
- `POST /api/mcp` - MCP server endpoint

## 🏗️ Project Structure
```
/app
  /api
    /mcp                 # MCP server endpoints
    /trust-score         # Trust score API
    /attestations        # Attestations API
  /dashboard             # Developer tools
  /docs                  # Documentation
/lib
  /intuition             # Intuition SDK integration
  /mcp                   # MCP tools and server logic
/components
  /ui                    # shadcn components
```

## 🚀 Deployment

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## 📖 Documentation

Visit `/docs` after running the dev server for complete API documentation and examples.

## 🎯 Use Cases

- **AI Hiring Assistant** - Verify candidate credentials via attestations
- **Trust-Gated Content** - Restrict access based on trust scores
- **Reputation Systems** - Build reputation tracking for your app
- **Expert Discovery** - Find trusted voices in specific domains

## 🤝 Contributing

This project is for the Intuition Ecosystem Grant. Contributions welcome!

## 📄 License

MIT License

## 🔗 Links

- [Intuition Portal](https://portal.intuition.systems/)
- [Intuition Docs](https://docs.intuition.systems/)
- [MCP Documentation](https://modelcontextprotocol.io/)

## 📧 Contact

- GitHub: [@rudazy](https://github.com/rudazy)
- Project: [Intuition MCP Server](https://github.com/rudazy/Intuition-)