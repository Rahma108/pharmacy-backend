
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import { StorageApproachEnum, UploadApproachEnum } from 'src/common/enum';



@Injectable()
export class S3Service {
  private readonly client: S3Client;

  private readonly applicationName: string;
  private readonly awsAccessKeyId: string;
  private readonly awsSecretAccessKey: string;
  private readonly awsBucketName: string;
  private readonly awsRegion: string;
  private readonly awsExpiresIn: number;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.applicationName =
      this.configService.get<string>(
        'APPLICATION_NAME',
      ) ?? 'pharmacy';

    this.awsAccessKeyId =
      this.configService.get<string>(
        'AWS_ACCESS_KEY_ID',
      ) ?? '';

    this.awsSecretAccessKey =
      this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY',
      ) ?? '';

    this.awsBucketName =
      this.configService.get<string>(
        'AWS_BUCKET_NAME',
      ) ?? '';

    this.awsRegion =
      this.configService.get<string>(
        'AWS_REGION',
      ) ?? 'us-east-1';

    this.awsExpiresIn = Number(
      this.configService.get<string>(
        'AWS_EXPIRES_IN',
      ) ?? 600,
    );

    this.client = new S3Client({
      region: this.awsRegion,

      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    });
  }

  // ==========================================
  // Generate S3 Key
  // ==========================================

  generateKey({
    folder,
    userId,
    originalName,
  }: {
    folder: string;
    userId?: string;
    originalName: string;
  }): string {
    const extension = extname(originalName);

    return `${this.applicationName}/${folder}${
      userId ? `/${userId}` : ''
    }/${randomUUID()}${extension}`;
  }

  // ==========================================
  // Upload Small File
  // ==========================================

  async uploadAsset({
    storageApproach = StorageApproachEnum.MEMORY,
    Bucket = this.awsBucketName,
    path = 'general',
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
  }: {
    storageApproach?: StorageApproachEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string;
  }): Promise<string> {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    const Key = this.generateKey({
      folder: path,
      originalName: file.originalname,
    });

    const command = new PutObjectCommand({
      Bucket,
      Key,
      ACL,

      Body:
        storageApproach ===
        StorageApproachEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),

      ContentType:
        file.mimetype || ContentType,
    });

    await this.client.send(command);

    return Key;
  }

  // ==========================================
  // Upload Large File
  // ==========================================

  async uploadLargeAsset({
    storageApproach = StorageApproachEnum.DISK,
    Bucket = this.awsBucketName,
    path = 'general',
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
    partSize = 5,
  }: {
    storageApproach?: StorageApproachEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    partSize?: number;
  }): Promise<string> {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    const Key = this.generateKey({
      folder: path,
      originalName: file.originalname,
    });

    const upload = new Upload({
      client: this.client,

      params: {
        Bucket,
        Key,
        ACL,

        Body:
          storageApproach ===
          StorageApproachEnum.MEMORY
            ? file.buffer
            : createReadStream(file.path),

        ContentType:
          file.mimetype || ContentType,
      },

      partSize: partSize * 1024 * 1024,
    });

    upload.on(
      'httpUploadProgress',
      (progress) => {
        if (
          progress.loaded &&
          progress.total
        ) {
          const percentage =
            (progress.loaded /
              progress.total) *
            100;

          console.log(
            `S3 Upload: ${percentage.toFixed(2)}%`,
          );
        }
      },
    );

    await upload.done();

    return Key;
  }

  // ==========================================
  // Upload Multiple Files
  // ==========================================

  async uploadAssets({
    storageApproach = StorageApproachEnum.MEMORY,
    uploadApproach = UploadApproachEnum.SMALL,
    Bucket = this.awsBucketName,
    path = 'general',
    files,
    ACL = ObjectCannedACL.private,
    ContentType,
  }: {
    storageApproach?: StorageApproachEnum;
    uploadApproach?: UploadApproachEnum;
    Bucket?: string;
    path?: string;
    files: Express.Multer.File[];
    ACL?: ObjectCannedACL;
    ContentType?: string;
  }): Promise<string[]> {
    if (!files?.length) {
      throw new BadRequestException(
        'Files are required',
      );
    }

    if (
      uploadApproach ===
      UploadApproachEnum.LARGE
    ) {
      return Promise.all(
        files.map((file) =>
          this.uploadLargeAsset({
            storageApproach,
            file,
            ACL,
            Bucket,
            ContentType,
            path,
          }),
        ),
      );
    }

    return Promise.all(
      files.map((file) =>
        this.uploadAsset({
          storageApproach,
          file,
          ACL,
          Bucket,
          ContentType,
          path,
        }),
      ),
    );
  }

  // ==========================================
  // Pre-Signed Upload URL
  // ==========================================

  async createPreSignedUploadLink({
    Bucket = this.awsBucketName,
    Key,
    expiresIn = this.awsExpiresIn,
    ContentType,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    ContentType?: string;
  }): Promise<{
    url: string;
    Key: string;
  }> {
    if (!Key?.trim()) {
      throw new BadRequestException(
        'S3 Key is required',
      );
    }

    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType,
    });

    const url = await getSignedUrl(
      this.client,
      command,
      {
        expiresIn,
      },
    );

    return {
      url,
      Key,
    };
  }

  // ==========================================
  // Get File
  // ==========================================

  async getAsset({
    Bucket = this.awsBucketName,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    if (!Key?.trim()) {
      throw new BadRequestException(
        'S3 Key is required',
      );
    }

    try {
      const command =
        new GetObjectCommand({
          Bucket,
          Key,
        });

      return await this.client.send(
        command,
      );
    } catch {
      throw new BadRequestException(
        'Failed to get asset',
      );
    }
  }

  // ==========================================
  // Pre-Signed Download URL
  // ==========================================

  async createPreSignedFetchLink({
    Bucket = this.awsBucketName,
    Key,
    expiresIn = this.awsExpiresIn,
    fileName,
    download = false,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    fileName?: string;
    download?: boolean;
  }): Promise<string> {
    if (!Key?.trim()) {
      throw new BadRequestException(
        'S3 Key is required',
      );
    }

    const command =
      new GetObjectCommand({
        Bucket,
        Key,

        ResponseContentDisposition:
          download
            ? `attachment; filename="${
                fileName ||
                Key.split('/').pop()
              }"`
            : undefined,
      });

    return getSignedUrl(
      this.client,
      command,
      {
        expiresIn,
      },
    );
  }

  // ==========================================
  // Delete File
  // ==========================================

  async deleteAsset({
    Bucket = this.awsBucketName,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    if (!Key?.trim()) {
      throw new BadRequestException(
        'S3 Key is required',
      );
    }

    const command =
      new DeleteObjectCommand({
        Bucket,
        Key,
      });

    return this.client.send(command);
  }

  // ==========================================
  // Delete Multiple Files
  // ==========================================

  async deleteAssets({
    Bucket = this.awsBucketName,
    Keys,
  }: {
    Bucket?: string;
    Keys: { Key: string }[];
  }): Promise<DeleteObjectsCommandOutput> {
    if (!Keys?.length) {
      throw new BadRequestException(
        'Keys are required',
      );
    }

    const command =
      new DeleteObjectsCommand({
        Bucket,

        Delete: {
          Objects: Keys,
          Quiet: false,
        },
      });

    return this.client.send(command);
  }

  // ==========================================
  // List Folder
  // ==========================================

  async listFolderDir({
    Bucket = this.awsBucketName,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const Prefix = `${this.applicationName}/${prefix}`;

    const command =
      new ListObjectsV2Command({
        Bucket,
        Prefix,
      });

    return this.client.send(command);
  }

  // ==========================================
  // Delete Folder
  // ==========================================

  async deleteFolderByPrefix({
    Bucket = this.awsBucketName,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<void> {
    const result =
      await this.listFolderDir({
        Bucket,
        prefix,
      });

    const Keys =
      result.Contents?.map((item) => ({
        Key: item.Key!,
      })) ?? [];

    if (!Keys.length) {
      return;
    }

    await this.deleteAssets({
      Bucket,
      Keys,
    });
  }

  // ==========================================
  // Check File Exists
  // ==========================================

  async exists({
    Bucket = this.awsBucketName,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<boolean> {
    if (!Key?.trim()) {
      return false;
    }

    try {
      const command =
        new HeadObjectCommand({
          Bucket,
          Key,
        });

      await this.client.send(command);

      return true;
    } catch (error: any) {
      if (
        error?.name === 'NotFound' ||
        error?.$metadata
          ?.httpStatusCode === 404
      ) {
        return false;
      }

      throw error;
    }
  }
}

