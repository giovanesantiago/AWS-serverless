import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as ssm from "aws-cdk-lib/aws-ssm";
import { ProductsAppStack } from './productsApp-stack';

export class ProductsAppLayersStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const productsLayers = new lambda.LayerVersion(this, "ProductsLayers", {
             code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),
             compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
            layerVersionName: "ProductsLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN, // manter layers pois vai ser utilizados em outros lugares 
        });

        new ssm.StringParameter(this, "ProductsLayerVersionArn", {
            parameterName: "ProductsLayerVersionArn",
            stringValue: productsLayers.layerVersionArn
        });


        const productEventLayers = new lambda.LayerVersion(this, "ProductEventLayer", {
            code: lambda.Code.fromAsset('lambda/products/layers/productEventLayer'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
           layerVersionName: "productEventLayer",
           removalPolicy: cdk.RemovalPolicy.RETAIN, // manter layers pois vai ser utilizados em outros lugares 
       });

       new ssm.StringParameter(this, "ProductEventLayerVersionArn", {
           parameterName: "ProductEventLayerVersionArn",
           stringValue: productEventLayers.layerVersionArn
       });
    }
}

