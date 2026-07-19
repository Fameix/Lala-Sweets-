# AI Architecture

AI requests go through server routes under `/api/ai/*`.

The provider boundary is `features/ai/server/provider.ts`. Business data is exposed through validated tools instead of free-form database access. The fallback provider searches the local catalogue, calculates cake servings deterministically, and requires confirmation before cart changes.

Future provider-backed generation should preserve the same `AIProvider` interface and continue validating output with Zod.

