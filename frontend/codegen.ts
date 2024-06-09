import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://video-touch-api.toufiq.dev/graphql',
  documents: 'pages/**/*.{ts,tsx}',
  ignoreNoDocuments: true,
  generates: {
    'api/graphql/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations']
    }
  }
};

export default config;
