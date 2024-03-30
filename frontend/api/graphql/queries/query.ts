import { gql } from '@apollo/client';

export const LIST_VIDEO_QUERY = gql`
query{
  ListVideo(listVideoInput:{first:10}){videos{_id,title,status,created_at,thumbnail_url},page_info{total_pages,end_cursor}}
}
`;
export const GET_VIDEO_QUERY = gql`
query($id:String!){
  GetVideo(getVideoInput:{_id:$id}){_id,title,height,width,duration,description,status_details{status,details,},size,source_url,tags,created_at,updated_at,thumbnail_url,latest_status}
}
`;