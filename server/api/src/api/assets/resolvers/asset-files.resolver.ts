import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Asset } from '@/src/api/assets/models/asset.model';
import { thumbnailByAssetLoader } from '@/src/api/assets/data-loaders/thumbnail-by-asset.loader';
import { FilesByAssetLoader } from '@/src/api/assets/data-loaders/asset-files.loader';
import { File } from '@/src/api/assets/models/file.model';

@Resolver(() => Asset)
export class AssetFilesResolver {
  constructor(private thumbnailLoader: thumbnailByAssetLoader, private filesByAssetLoader: FilesByAssetLoader) {}

  @ResolveField('thumbnail_url', () => String)
  async getThumbnailUrlOfAsset(@Parent() asset: Asset) {
    return this.thumbnailLoader.load(asset._id);
  }

  @ResolveField('files', () => [File])
  async getFilesOfAsset(@Parent() asset: Asset) {
    return this.filesByAssetLoader.load(asset._id.toString());
  }
}
