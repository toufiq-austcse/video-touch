import { gql } from '@apollo/client';

export const LIST_ASSETS = gql`
query($first:Float,$before:String,$after:String){
  ListAsset(listAssetInputDto:{first:$first,before:$before,after:$after}){assets{_id,title,status,created_at,thumbnail_url},page_info{total_pages,prev_cursor,next_cursor}}
}
`;
export const GET_ASSET_QUERY = gql`
query($id:String!){
  GetAsset(getAssetInputDto:{_id:$id}){_id,title,height,width,duration,description,status_logs{status,details,created_at},size,source_url,tags,created_at,updated_at,thumbnail_url,latest_status,master_playlist_url}
}
`;

export const CREATE_ASSET_MUTATION = gql`
mutation($title:String,$description:String,$source_url:String!,$tags:[String!]){
  CreateAsset(createAssetInput:{title:$title,source_url:$source_url,description:$description,tags:$tags}){_id,title}
}
`;