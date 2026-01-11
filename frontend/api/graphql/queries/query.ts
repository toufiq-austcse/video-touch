import { gql } from "@apollo/client";

export const LIST_ASSETS = gql`
  query ($first: Float, $before: String, $after: String, $search: String) {
    ListAsset(
      listAssetInputDto: {
        first: $first
        before: $before
        after: $after
        search: $search
      }
    ) {
      assets {
        _id
        title
        latest_status
        duration
        created_at
        thumbnail_url
      }
      page_info {
        total_pages
        prev_cursor
        next_cursor
      }
    }
  }
`;

export const GET_ASSET_QUERY = gql`
  query ($id: String!) {
    GetAsset(getAssetInputDto: { _id: $id }) {
      _id
      title
      height
      width
      duration
      description
      status_logs {
        status
        details
        created_at
      }
      size
      tags
      created_at
      updated_at
      thumbnail_url
      latest_status
      master_playlist_url
      files {
        _id
        name
        size
        latest_status
        height
        width
        type
      }
      with_transcription
      with_transcoding
    }
  }
`;

export const CREATE_ASSET_MUTATION = gql`
  mutation (
    $title: String
    $description: String
    $source_url: String!
    $tags: [String!]
    $with_transcoding: Boolean
    $with_transcription: Boolean
  ) {
    CreateAsset(
      createAssetInput: {
        title: $title
        source_url: $source_url
        description: $description
        tags: $tags
        with_transcoding: $with_transcoding
        with_transcription: $with_transcription
      }
    ) {
      _id
      title
    }
  }
`;

export const CREATE_ASSET_FROM_UPLOAD_MUTATION = gql`
  mutation (
    $title: String
    $description: String
    $file_name: String!
    $tags: [String!]
  ) {
    CreateAssetFromUpload(
      createAssetFromUploadInput: {
        title: $title
        file_name: $file_name
        description: $description
        tags: $tags
      }
    ) {
      _id
      title
    }
  }
`;

export const UPDATE_ASSET_MUTATION = gql`
  mutation (
    $id: String!
    $title: String
    $description: String
    $tags: [String!]
  ) {
    UpdateAsset(
      _id: $id
      updateAssetInputDto: {
        title: $title
        description: $description
        tags: $tags
      }
    ) {
      title
      description
      tags
    }
  }
`;

export const RECREATE_ASSET_MUTATION = gql`
  mutation ($id: String!) {
    RecreateAsset(recreateAssetInputDto: { _id: $id }) {
      _id
      title
    }
  }
`;

export const REPROCESS_ASSET_MUTATION = gql`
  mutation ($id: String!) {
    ReprocessAsset(reprocessAssetInputDto: { _id: $id }) {
      _id
      title
    }
  }
`;

export const GET_ASSET_MASTER_PLAYLIST_SIGNED_URL = gql`
  query ($id: String!) {
    GetAssetMasterPlaylistSignedUrl(_id: $id) {
      main_playlist_url
      resolutions_token
    }
  }
`;

export const GET_FILE_URL = gql`
  query ($id: String!) {
    GetFileUrl(id: $id)
  }
`;

export const LIST_WEBHOOKS = gql`
  query ($first: Float, $before: String, $after: String, $search: String) {
    ListWebhook(
      listWebhookInputDto: {
        first: $first
        before: $before
        after: $after
        search: $search
      }
    ) {
      webhooks {
        _id
        url
        secret_token
        created_at
        updated_at
      }
      page_info {
        total_pages
        prev_cursor
        next_cursor
      }
    }
  }
`;

export const CREATE_WEBHOOK_MUTATION = gql`
  mutation ($url: String!, $secret_token: String) {
    CreateWebhook(
      createWebhookInput: { url: $url, secret_token: $secret_token }
    ) {
      _id
      url
      secret_token
      created_at
      updated_at
    }
  }
`;

export const UPDATE_WEBHOOK_MUTATION = gql`
  mutation ($id: String!, $url: String, $secret_token: String) {
    UpdateWebhook(
      _id: $id
      updateWebhookInputDto: { url: $url, secret_token: $secret_token }
    ) {
      _id
      url
      secret_token
      created_at
      updated_at
    }
  }
`;

export const DELETE_WEBHOOK_MUTATION = gql`
  mutation ($id: String!) {
    DeleteWebhook(_id: $id)
  }
`;

