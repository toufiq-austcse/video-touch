import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Asset } from '@/src/api/assets/models/asset.model';
import { AssetThumbnailLoader } from '@/src/api/assets/data-loaders/asset-thumbnail .loader';

@Resolver(() => Asset)
export class AssetFilesResolver {
  constructor(private thumbnailLoader: AssetThumbnailLoader) {
  }

  @ResolveField('thumbnail_url', () => String)
  async getFilesOfAsset(@Parent() asset: Asset) {
    return  this.thumbnailLoader.load(asset._id.toString());
  }
}