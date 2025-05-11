import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as ssm from "aws-cdk-lib/aws-ssm";
import { ProductsAppStack } from './productsApp-stack';

export class ProductsAppLayersStack extends cdk.Stack {
    readonly productsLayers: lambda.LayerVersion;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.productsLayers = new lambda.LayerVersion(this, "ProductsLayers", {
             code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),
             compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
            layerVersionName: "ProductsLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN, // manter layers pois vai ser utilizados em outros lugares 
        });

        new ssm.StringParameter(this, "ProductsLayerVersionArn", {
            parameterName: "ProductsLayerVersionArn",
            stringValue: this.productsLayers.layerVersionArn
        });
    }
}

