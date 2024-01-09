import {
  AlbumApi,
  LibraryApi,
  APIKeyApi,
  AssetApi,
  AssetApiFp,
  AssetJobName,
  AuthenticationApi,
  Configuration,
  ConfigurationParameters,
  JobApi,
  JobName,
  OAuthApi,
  PartnerApi,
  PersonApi,
  SearchApi,
  ServerInfoApi,
  SharedLinkApi,
  SystemConfigApi,
  UserApi,
  UserApiFp,
  AuditApi,
  ActivityApi,
  FaceApi,
} from './open-api';
import { BASE_PATH } from './open-api/base';
import { DUMMY_BASE_URL, toPathString } from './open-api/common';
import type { ApiParams } from './types';

class ImmichApi {
  public activityApi: ActivityApi;
  public albumApi: AlbumApi;
  public libraryApi: LibraryApi;
  public assetApi: AssetApi;
  public auditApi: AuditApi;
  public authenticationApi: AuthenticationApi;
  public faceApi: FaceApi;
  public jobApi: JobApi;
  public keyApi: APIKeyApi;
  public oauthApi: OAuthApi;
  public partnerApi: PartnerApi;
  public searchApi: SearchApi;
  public serverInfoApi: ServerInfoApi;
  public sharedLinkApi: SharedLinkApi;
  public personApi: PersonApi;
  public systemConfigApi: SystemConfigApi;
  public userApi: UserApi;

  private config: Configuration;
  private key?: string;

  get isSharedLink() {
    return !!this.key;
  }

  constructor(params: ConfigurationParameters) {
    this.config = new Configuration(params);

    this.activityApi = new ActivityApi(this.config);
    this.albumApi = new AlbumApi(this.config);
    this.auditApi = new AuditApi(this.config);
    this.libraryApi = new LibraryApi(this.config);
    this.assetApi = new AssetApi(this.config);
    this.authenticationApi = new AuthenticationApi(this.config);
    this.faceApi = new FaceApi(this.config);
    this.jobApi = new JobApi(this.config);
    this.keyApi = new APIKeyApi(this.config);
    this.oauthApi = new OAuthApi(this.config);
    this.partnerApi = new PartnerApi(this.config);
    this.searchApi = new SearchApi(this.config);
    this.serverInfoApi = new ServerInfoApi(this.config);
    this.sharedLinkApi = new SharedLinkApi(this.config);
    this.personApi = new PersonApi(this.config);
    this.systemConfigApi = new SystemConfigApi(this.config);
    this.userApi = new UserApi(this.config);
  }

  private createUrl(path: string, params?: Record<string, unknown>) {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    }

    const url = new URL(path, DUMMY_BASE_URL);
    url.search = searchParams.toString();

    return (this.config.basePath || BASE_PATH) + toPathString(url);
  }

  public setKey(key: string) {
    this.key = key;
  }

  public getKey(): string | undefined {
    return this.key;
  }

  public setAccessToken(accessToken: string) {
    this.config.accessToken = accessToken;
  }

  public removeAccessToken() {
    this.config.accessToken = undefined;
  }

  public setBaseUrl(baseUrl: string) {
    this.config.basePath = baseUrl;
  }

  public getAssetFileUrl(...[assetId, isThumb, isWeb]: ApiParams<typeof AssetApiFp, 'serveFile'>) {
    const path = `/asset/file/${assetId}`;
    return this.createUrl(path, { isThumb, isWeb, key: this.getKey() });
  }

  public getAssetThumbnailUrl(...[assetId, format]: ApiParams<typeof AssetApiFp, 'getAssetThumbnail'>) {
    const path = `/asset/thumbnail/${assetId}`;
    return this.createUrl(path, { format, key: this.getKey() });
  }

  public getProfileImageUrl(...[userId]: ApiParams<typeof UserApiFp, 'getProfileImage'>) {
    const path = `/user/profile-image/${userId}`;
    return this.createUrl(path);
  }

  public getPeopleThumbnailUrl(personId: string) {
    const path = `/person/${personId}/thumbnail`;
    return this.createUrl(path);
  }

  public getJobName(jobName: JobName) {
    const names: Record<JobName, string> = {
      [JobName.ThumbnailGeneration]: '生成缩略图',
      [JobName.MetadataExtraction]: '提取元数据',
      [JobName.Sidecar]: 'Sidecar元数据',
      [JobName.SmartSearch]: '智能搜索',
      [JobName.RecognizeFaces]: '人脸识别',
      [JobName.VideoConversion]: '视频转码',
      [JobName.StorageTemplateMigration]: '存储模板迁移',
      [JobName.Migration]: '迁移',
      [JobName.BackgroundTask]: '后台任务',
      [JobName.Search]: '搜索',
      [JobName.Library]: '图库',
    };

    return names[jobName];
  }

  public getAssetJobName(job: AssetJobName) {
    const names: Record<AssetJobName, string> = {
      [AssetJobName.RefreshMetadata]: '刷新元数据',
      [AssetJobName.RegenerateThumbnail]: '重新生成缩略图',
      [AssetJobName.TranscodeVideo]: '刷新已编码的视频',
    };

    return names[job];
  }

  public getAssetJobMessage(job: AssetJobName) {
    const messages: Record<AssetJobName, string> = {
      [AssetJobName.RefreshMetadata]: '刷新元数据',
      [AssetJobName.RegenerateThumbnail]: `重新生成缩略图`,
      [AssetJobName.TranscodeVideo]: `刷新已编码的视频`,
    };

    return messages[job];
  }
}

export const api = new ImmichApi({ basePath: '/api' });
