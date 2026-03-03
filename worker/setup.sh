#!/bin/bash

# PromptUp Worker Setup Script
# This script automates KV namespace creation and configuration

echo "╔════════════════════════════════════════╗"
echo "║  PromptUp Worker Setup Script          ║"
echo "║  Cloudflare Workers Configuration     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler version:"
wrangler --version
echo ""

# Step 1: Verify authentication
echo "🔐 Checking Cloudflare authentication..."
if wrangler whoami > /dev/null 2>&1; then
    echo "✅ Authenticated"
else
    echo "❌ Not authenticated. Please run: wrangler login"
    exit 1
fi
echo ""

# Step 2: Create KV namespaces
echo "📦 Creating KV namespaces..."

# Production namespace
echo "  Creating production namespace..."
PROD_RESULT=$(wrangler kv:namespace create "RATE_LIMIT_KV" 2>&1)
PROD_ID=$(echo "$PROD_RESULT" | grep -oP "(?<=id\": \")[^\"]*" | head -1 || echo "")

if [ -z "$PROD_ID" ]; then
    echo "    ⚠️  Could not extract production ID. Trying alternate method..."
    PROD_ID=$(echo "$PROD_RESULT" | grep -oP "\b[a-f0-9]{16}\b" | head -1)
fi

if [ -n "$PROD_ID" ]; then
    echo "    ✅ Production ID: $PROD_ID"
else
    echo "    ❌ Failed to create production namespace"
    echo "    Output: $PROD_RESULT"
    exit 1
fi

# Preview namespace
echo "  Creating preview namespace..."
PREVIEW_RESULT=$(wrangler kv:namespace create "RATE_LIMIT_KV" --preview 2>&1)
PREVIEW_ID=$(echo "$PREVIEW_RESULT" | grep -oP "(?<=id\": \")[^\"]*" | head -1 || echo "")

if [ -z "$PREVIEW_ID" ]; then
    echo "    ⚠️  Could not extract preview ID. Using production ID..."
    PREVIEW_ID=$PROD_ID
fi

if [ -n "$PREVIEW_ID" ]; then
    echo "    ✅ Preview ID: $PREVIEW_ID"
else
    echo "    ⚠️  Using production ID for preview"
    PREVIEW_ID=$PROD_ID
fi
echo ""

# Step 3: Update wrangler.toml
echo "📝 Updating wrangler.toml..."
WRANGLER_FILE="wrangler.toml"

# Create backup
cp "$WRANGLER_FILE" "$WRANGLER_FILE.backup"
echo "  ✅ Backup created: $WRANGLER_FILE.backup"

# Update KV namespace IDs
sed -i "s/id = \"your-kv-namespace-id-here\"/id = \"$PROD_ID\"/" "$WRANGLER_FILE"
sed -i "s/preview_id = \"your-preview-kv-namespace-id-here\"/preview_id = \"$PREVIEW_ID\"/" "$WRANGLER_FILE"

echo "  ✅ Updated KV namespace IDs"
echo ""

# Step 4: Verify configuration
echo "✓ Configuration Summary:"
echo "  Production ID: $PROD_ID"
echo "  Preview ID:   $PREVIEW_ID"
echo "  Wrangler Config: $WRANGLER_FILE"
echo ""

# Step 5: Set secrets
echo "🔑 Configuring secrets..."
echo "  ⚠️  You'll be prompted to enter sensitive values"
echo ""

read -p "  Do you want to set GEMINI_API_KEY secret now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler secret put GEMINI_API_KEY
    echo "    ✅ GEMINI_API_KEY configured"
else
    echo "    ⏭️  Skipped. You can set it later with:"
    echo "      wrangler secret put GEMINI_API_KEY"
fi
echo ""

# Step 6: Ready to deploy
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Deploy: wrangler deploy"
echo "  2. Update index.html with your worker URL"
echo "  3. Deploy frontend to GitHub Pages"
echo ""
echo "To verify configuration:"
echo "  cat wrangler.toml"
echo "  wrangler secret list"
echo ""
