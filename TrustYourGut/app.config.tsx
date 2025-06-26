import 'dotenv/config';

export default {
  expo: {
    name: 'TrustYourGut',
    slug: 'trust-your-gut',
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
    },
  },
};