# AI Privacy

The AI layer stores only customer-visible messages and structured tool results when persistence is enabled. Raw voice audio is not stored by default.

Conversation, message, custom cake summary, and transcript tables include RLS policies so customers can only access their own records after Supabase auth is connected.

