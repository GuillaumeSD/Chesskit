import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AccessLevel, Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import {
  BucketDeployment,
  CacheControl,
  Source,
} from "aws-cdk-lib/aws-s3-deployment";
import path from "path";
import { renameSync } from "fs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";

interface AppStackProps extends cdk.StackProps {
  domainName: string;
  pagePaths: string[];
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const { domainName, pagePaths } = props;

    for (const pageName of pagePaths) {
      renameSync(
        path.resolve(__dirname, `../out/${pageName}.html`),
        path.resolve(__dirname, `../out/${pageName}`)
      );
    }

    const mainBucket = new Bucket(this, "Bucket", {
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    const enginesBucket = new Bucket(this, "EnginesBucket", {
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
    });

    new BucketDeployment(this, "BucketDeployment", {
      destinationBucket: mainBucket,
      sources: [
        Source.asset(path.resolve(__dirname, "../out"), {
          exclude: ["engines"],
        }),
      ],
      exclude: [...pagePaths, "*.html"],
      memoryLimit: 512,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(cdk.Duration.days(1)),
      ],
    });

    new BucketDeployment(this, "BucketPagesDeployment", {
      destinationBucket: mainBucket,
      sources: [
        Source.asset(path.resolve(__dirname, "../out"), {
          exclude: ["engines"],
        }),
      ],
      exclude: ["*"],
      include: [...pagePaths, "*.html"],
      memoryLimit: 512,
      cacheControl: [
        CacheControl.noCache(),
        CacheControl.maxAge(cdk.Duration.millis(0)),
      ],
      contentType: "text/html",
    });

    new BucketDeployment(this, "BucketEnginesDeployment", {
      destinationBucket: enginesBucket,
      destinationKeyPrefix: "engines",
      sources: [Source.asset(path.resolve(__dirname, "../out/engines"))],
      memoryLimit: 512,
      ephemeralStorageSize: cdk.Size.gibibytes(1),
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(cdk.Duration.days(365)),
        CacheControl.immutable(),
      ],
    });

    const mainOriginAccessControl = S3BucketOrigin.withOriginAccessControl(
      mainBucket,
      {
        originAccessLevels: [AccessLevel.READ],
      }
    );

    const enginesOriginAccessControl = S3BucketOrigin.withOriginAccessControl(
      enginesBucket,
      {
        originAccessLevels: [AccessLevel.READ],
      }
    );

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName,
    });

    // eslint-disable-next-line
    const certificate = new DnsValidatedCertificate(this, "Certificate", {
      domainName,
      hostedZone,
      region: "us-east-1",
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
      ],
      defaultBehavior: {
        origin: mainOriginAccessControl,
      },
      additionalBehaviors: {
        "/engines/*": {
          origin: enginesOriginAccessControl,
        },
      },
      domainNames: [domainName],
      certificate,
    });

    new ARecord(this, "AliasRecord", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new cdk.CfnOutput(this, "SiteUrl", { value: `https://${domainName}` });
  }
}
