import { gql } from '@apollo/client';

export const LIST_VIDEO_QUERY = gql`
query{
  ListVideo(listVideoInput:{first:10}){videos{_id,title,status,created_at,thumbnail_url},page_info{total_pages,end_cursor}}
}
`;