import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://video-touch-api.toufiq.dev/graphql',
  ignoreNoDocuments: false,
  generates: {
    'api/graphql/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations']
    }
  }
};

export default config;
