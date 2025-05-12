import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { ProductsAppLayersStack } from './productsAppLayers-stack';

interface ProductsAppStackProps extends cdk.StackProps{
    eventDdb: dynamodb.Table
}

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
    readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
    readonly productsDdb: dynamodb.Table;

    constructor(scope: Construct, id: string, props: ProductsAppStackProps) {
        super(scope, id, props);

        this.productsDdb = new dynamodb.Table(this, "ProductsDdb" , {
            tableName: "products",
            // Configuracao so para facilitar a removao de todo os recursos por ser um projeto ficticio 
            // Atencao essa configuracao faz com que o banco se apague junto com a Stack
            removalPolicy: cdk.RemovalPolicy.DESTROY, 
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        });

        //Products Layer
        const productsLayersArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn");
        const productsLayers = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayersArn);
        const productsEventLayersArn = ssm.StringParameter.valueForStringParameter(this, "ProductEventLayerVersionArn");
        const productsEventLayers = lambda.LayerVersion.fromLayerVersionArn(this, "ProductEventLayerVersionArn", productsEventLayersArn);

        const productEventHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsEventFunction', {
            runtime: lambda.Runtime.NODEJS_22_X,
            functionName: 'ProductsEventFunction', 
            entry: 'lambda/products/productEventFunction.ts', 
            handler: 'handler',
            memorySize: 512,
            timeout: cdk.Duration.seconds(2),
            bundling: {
                minify: true,
                sourceMap: false,
                nodeModules: [
                    'aws-xray-sdk-core'
                ]
            },
            environment: { // Variasveis de ambiente
                EVENT_DDB: props.eventDdb.tableName
            },
            layers: [productsEventLayers],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
        });
        props.eventDdb.grantWriteData(productEventHandler);

        this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsFetchFunction', {
            runtime: lambda.Runtime.NODEJS_22_X,
            functionName: 'ProductsFetchFunction', 
            entry: 'lambda/products/productsFetchFunction.ts', 
            handler: 'handler',
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false,
                nodeModules: [
                    'aws-xray-sdk-core'
                ]
            },
            environment: { // Variasveis de ambiente
                PRODUCTS_DDB: this.productsDdb.tableName
            },
            layers: [productsLayers],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
        });
        this.productsDdb.grantReadData(this.productsFetchHandler);

        this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(this, "ProductsAdminFunction", {
            runtime: lambda.Runtime.NODEJS_22_X,
            functionName: "ProductsAdminFunction",
            entry: 'lambda/products/productsAdminFunction.ts',
            handler: 'handler',
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false,
                nodeModules: [
                    'aws-xray-sdk-core'
                ]
            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName,
                PRODUCT_EVENT_FUNCTION_NAME: productEventHandler.functionName
            },
            layers: [productsLayers, productsEventLayers],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
        });
        this.productsDdb.grantWriteData(this.productsAdminHandler);
        productEventHandler.grantInvoke(this.productsAdminHandler);    

    }
}
